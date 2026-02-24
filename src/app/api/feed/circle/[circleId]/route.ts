import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  circleId: string
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
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

    const circleId = params.circleId
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Check if user is member of this circle
    const membership = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId: circleId,
          userId: user.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this circle' }, { status: 403 })
    }

    // Get all members of this circle
    const circleMembers = await prisma.circleMember.findMany({
      where: { circleId: circleId },
      select: { userId: true }
    })

    const memberUserIds = circleMembers.map(cm => cm.userId)

    // Build the query for circle feed items
    const whereClause = {
      userId: { in: memberUserIds },
      status: 'ACTIVE' as const,
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

    // Get circle info
    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      select: { id: true, name: true }
    })

    // Enrich items with social data
    const enrichedItems = feedItems.map(item => ({
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
      circles: circle ? [circle] : []
    }))

    const nextCursor = hasMore ? feedItems[feedItems.length - 1].createdAt.toISOString() : null

    return NextResponse.json({
      items: enrichedItems,
      nextCursor,
      hasMore,
      circle
    })

  } catch (error) {
    console.error('Circle feed API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}