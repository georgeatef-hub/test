import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/circles/[id] - Circle detail
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
      return NextResponse.json({ error: "Forbidden - Not a member of this circle" }, { status: 403 })
    }

    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        admin: {
          select: { id: true, name: true, image: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          },
          orderBy: { joinedAt: 'asc' }
        }
      }
    })

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 })
    }

    // Get stats
    const [itemCount, tradeCount, recentSwipes] = await Promise.all([
      prisma.item.count({
        where: {
          status: 'ACTIVE',
          user: {
            circleMemberships: {
              some: { circleId }
            }
          }
        }
      }),
      prisma.trade.count({
        where: { circleId }
      }),
      prisma.swipe.findMany({
        where: { circleId },
        include: {
          user: {
            select: { name: true, image: true }
          },
          item: {
            select: { title: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ])

    return NextResponse.json({
      ...circle,
      stats: {
        memberCount: circle.members.length,
        itemCount,
        tradeCount
      },
      recentActivity: recentSwipes
    })
  } catch (error) {
    console.error("Error fetching circle detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/circles/[id] - Update circle (admin only)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const circleId = params.id
    const body = await request.json()
    const { name, description } = body

    const circle = await prisma.circle.findUnique({
      where: { id: circleId }
    })

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 })
    }

    if (circle.adminId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 })
    }

    const updatedCircle = await prisma.circle.update({
      where: { id: circleId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      },
      include: {
        admin: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    return NextResponse.json(updatedCircle)
  } catch (error) {
    console.error("Error updating circle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/circles/[id] - Delete circle (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const circleId = params.id

    const circle = await prisma.circle.findUnique({
      where: { id: circleId }
    })

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 })
    }

    if (circle.adminId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 })
    }

    await prisma.circle.delete({
      where: { id: circleId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting circle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}