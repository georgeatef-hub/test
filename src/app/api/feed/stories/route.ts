import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get users from shared circles who posted items recently (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Find all circles the current user is a member of
    const userCircles = await prisma.circleMember.findMany({
      where: { userId },
      select: { circleId: true }
    })

    const circleIds = userCircles.map(uc => uc.circleId)

    // Find all users in those circles who have posted recently, excluding current user
    const recentPosters = await prisma.user.findMany({
      where: {
        id: { not: userId },
        circleMemberships: {
          some: {
            circleId: { in: circleIds }
          }
        },
        items: {
          some: {
            createdAt: { gte: sevenDaysAgo },
            status: 'ACTIVE'
          }
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        items: {
          where: {
            createdAt: { gte: sevenDaysAgo },
            status: 'ACTIVE'
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true }
        }
      }
    })

    // Transform and sort by most recent post
    const storyUsers = recentPosters
      .filter(user => user.items.length > 0)
      .map(user => ({
        id: user.id,
        name: user.name,
        image: user.image,
        hasNewItems: true,
        lastPostAt: user.items[0].createdAt
      }))
      .sort((a, b) => new Date(b.lastPostAt).getTime() - new Date(a.lastPostAt).getTime())
      .slice(0, 20) // Limit to 20 users

    return NextResponse.json({
      users: storyUsers
    })

  } catch (error) {
    console.error('Error fetching story users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}