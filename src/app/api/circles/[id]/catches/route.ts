import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/circles/[id]/catches - Items user swiped right on in this circle
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

    const swipes = await prisma.swipe.findMany({
      where: {
        userId: session.user.id,
        circleId,
        direction: 'RIGHT'
      },
      include: {
        item: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const items = swipes.map(swipe => swipe.item)

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching catches:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}