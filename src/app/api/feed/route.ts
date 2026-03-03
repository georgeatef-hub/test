import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get user's circles
    const userCircles = await prisma.circleMember.findMany({
      where: { userId: user.id },
      select: { circleId: true }
    })

    const circleIds = userCircles.map(cm => cm.circleId)

    // Build the query for feed items
    // Show items from circles the user is a member of, OR items from circle members (legacy items without circleId)
    const circleMembers = await prisma.circleMember.findMany({
      where: { circleId: { in: circleIds } },
      select: { userId: true }
    })
    const memberUserIds = Array.from(new Set(circleMembers.map(cm => cm.userId)))

    const whereClause = {
      status: 'ACTIVE' as const,
      OR: [
        { circleId: { in: circleIds } },
        { circleId: null, userId: { in: memberUserIds } },
      ],
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {})
    }

    // Get feed items with all necessary data
    const items = await prisma.item.findMany({
      where: whereClause,
      include: {
        user: true,
        _count: {
          select: {
            likes: true,
            comments: true,
            swipes: {
              where: { direction: 'RIGHT', undone: false }
            }
          }
        },
        likes: {
          where: { userId: user.id },
          select: { id: true }
        },
        swipes: {
          where: { userId: user.id, direction: 'RIGHT', undone: false },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1
    })

    const hasMore = items.length > limit
    const feedItems = hasMore ? items.slice(0, -1) : items

    // Enrich items with social data and circle info
    const enrichedItems = await Promise.all(
      feedItems.map(async (item) => {
        // Get circles this item's owner shares with current user
        const sharedCircles = circleIds.length > 0
          ? await prisma.circle.findMany({
              where: {
                id: { in: circleIds },
                members: {
                  some: { userId: item.userId }
                }
              },
              select: { id: true, name: true }
            })
          : []

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          condition: item.condition,
          tags: item.tags,
          images: item.images,
          userId: item.userId,
          createdAt: item.createdAt,
          user: item.user,
          likeCount: item._count.likes,
          commentCount: item._count.comments,
          wantCount: item._count.swipes,
          isLikedByCurrentUser: item.likes.length > 0,
          isWantedByCurrentUser: item.swipes.length > 0,
          isOwnItem: item.userId === user.id,
          circles: sharedCircles
        }
      })
    )

    const nextCursor = hasMore ? feedItems[feedItems.length - 1].createdAt.toISOString() : null

    return NextResponse.json({
      items: enrichedItems,
      nextCursor,
      hasMore
    })

  } catch (error) {
    console.error('Feed API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
