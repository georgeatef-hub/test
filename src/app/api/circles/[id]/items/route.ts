import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/circles/[id]/items - Get items in a specific circle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const circleId = params.id

  try {
    // Verify user is a member of the circle
    const membership = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: session.user.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "You are not a member of this circle" }, { status: 403 })
    }

    // Get items posted to this circle
    const items = await prisma.item.findMany({
      where: {
        circleId,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: {
            swipes: {
              where: { direction: 'RIGHT', undone: false }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching circle items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}