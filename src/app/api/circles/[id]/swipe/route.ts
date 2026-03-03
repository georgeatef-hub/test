import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/circles/[id]/swipe - Get swipeable items for a circle
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const circleId = params.id

    // Check if user is a member of this circle
    const membership = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: session.user.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this circle" }, { status: 403 })
    }

    // Get circle member IDs to include their legacy (no circleId) items
    const circleMembers = await prisma.circleMember.findMany({
      where: { circleId },
      select: { userId: true }
    })
    const memberUserIds = circleMembers.map(cm => cm.userId)

    // Get items: posted to this circle OR legacy items from circle members
    const items = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        NOT: { userId: session.user.id }, // Exclude own items
        OR: [
          { circleId }, // Items posted to this specific circle
          { circleId: null, userId: { in: memberUserIds } }, // Legacy items from members
        ],
        AND: {
          OR: [
            // Items never swiped on
            {
              swipes: {
                none: {
                  userId: session.user.id,
                  circleId
                }
              }
            },
            // Items swiped LEFT and undone
            {
              swipes: {
                some: {
                  userId: session.user.id,
                  circleId,
                  direction: 'LEFT',
                  undone: true
                }
              }
            }
          ]
        }
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: {
            swipes: {
              where: {
                circleId,
                direction: 'RIGHT'
              }
            }
          }
        }
      },
      take: 20 // Paginate - limit 20
    })

    // Randomize order (simple shuffle)
    const shuffledItems = items.sort(() => Math.random() - 0.5)

    const itemsWithWantCount = shuffledItems.map(item => ({
      ...item,
      wantCount: item._count.swipes
    }))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const responseItems = itemsWithWantCount.map(({ _count, ...item }) => item)
    return NextResponse.json({ items: responseItems, totalCount: responseItems.length })
  } catch (error) {
    console.error("Error fetching swipeable items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/circles/[id]/swipe - Record swipe
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const circleId = params.id
    const body = await request.json()
    const { itemId, direction } = body

    if (!itemId || !direction || !['RIGHT', 'LEFT'].includes(direction)) {
      return NextResponse.json({ error: "itemId and direction (RIGHT/LEFT) are required" }, { status: 400 })
    }

    // Check if user is a member of this circle
    const membership = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: session.user.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this circle" }, { status: 403 })
    }

    // Upsert swipe record
    await prisma.swipe.upsert({
      where: {
        userId_itemId_circleId: {
          userId: session.user.id,
          itemId,
          circleId
        }
      },
      update: {
        direction,
        undone: false
      },
      create: {
        userId: session.user.id,
        itemId,
        circleId,
        direction
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording swipe:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}