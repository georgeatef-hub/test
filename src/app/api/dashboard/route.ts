import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/dashboard - Dashboard data
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get bait score (count of ACTIVE items)
    const baitScore = await prisma.item.count({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })

    // Calculate fishing level based on bait score
    let fishingLevel: string
    if (baitScore === 0) {
      fishingLevel = "Beginner"
    } else if (baitScore <= 3) {
      fishingLevel = "Novice"
    } else if (baitScore <= 7) {
      fishingLevel = "Amateur"
    } else if (baitScore <= 15) {
      fishingLevel = "Experienced"
    } else if (baitScore <= 30) {
      fishingLevel = "Professional"
    } else {
      fishingLevel = "Master"
    }

    // Get user's circles with stats
    const circles = await prisma.circle.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        _count: {
          select: {
            members: true,
            trades: true
          }
        }
      }
    })

    // Calculate item count and new items for each circle
    const circlesWithStats = await Promise.all(
      circles.map(async (circle) => {
        const itemCount = await prisma.item.count({
          where: {
            status: 'ACTIVE',
            user: {
              circleMemberships: {
                some: {
                  circleId: circle.id
                }
              }
            }
          }
        })

        // Get items added in last 24 hours
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)

        const newItems = await prisma.item.count({
          where: {
            status: 'ACTIVE',
            createdAt: { gte: oneDayAgo },
            user: {
              circleMemberships: {
                some: {
                  circleId: circle.id
                }
              }
            }
          }
        })

        return {
          id: circle.id,
          name: circle.name,
          description: circle.description,
          memberCount: circle._count.members,
          itemCount,
          tradeCount: circle._count.trades,
          newItems
        }
      })
    )

    // Get recent items (last 5 items user listed)
    const recentItems = await prisma.item.findMany({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      },
      select: {
        id: true,
        title: true,
        images: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get catches count (items user swiped right on)
    const catchesCount = await prisma.swipe.count({
      where: {
        userId: session.user.id,
        direction: 'RIGHT'
      }
    })

    // Get completed trades count
    const completedTradesCount = await prisma.trade.count({
      where: {
        status: 'COMPLETED',
        members: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    // Get user streak info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        streakDays: true, 
        streakLastDate: true,
        lastActiveAt: true 
      }
    })

    return NextResponse.json({
      baitScore,
      fishingLevel,
      circles: circlesWithStats,
      recentItems,
      catchesCount,
      tradesCount: completedTradesCount,
      streak: {
        days: user?.streakDays || 0,
        lastDate: user?.streakLastDate,
        lastActive: user?.lastActiveAt
      }
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}