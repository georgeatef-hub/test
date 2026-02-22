import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Generate a random 6-character alphanumeric invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// POST /api/circles - Create circle
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Generate unique invite code
    let inviteCode: string
    let isUnique = false
    let attempts = 0
    
    do {
      inviteCode = generateInviteCode()
      const existing = await prisma.circle.findUnique({
        where: { inviteCode }
      })
      isUnique = !existing
      attempts++
    } while (!isUnique && attempts < 10)

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique invite code" }, { status: 500 })
    }

    // Create circle and add creator as admin and first member
    const circle = await prisma.circle.create({
      data: {
        name,
        description: description || null,
        inviteCode: inviteCode!,
        adminId: session.user.id,
        members: {
          create: {
            userId: session.user.id
          }
        }
      },
      include: {
        admin: {
          select: { id: true, name: true, image: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      }
    })

    return NextResponse.json(circle)
  } catch (error) {
    console.error("Error creating circle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/circles - List my circles
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const circles = await prisma.circle.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        admin: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: {
            members: true,
            trades: true
          }
        }
      }
    })

    // Calculate item count for each circle (items from members with status ACTIVE)
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

        return {
          ...circle,
          memberCount: circle._count.members,
          itemCount,
          tradeCount: circle._count.trades
        }
      })
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return NextResponse.json(circlesWithStats.map(({ _count, ...circle }) => circle))
  } catch (error) {
    console.error("Error fetching circles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}