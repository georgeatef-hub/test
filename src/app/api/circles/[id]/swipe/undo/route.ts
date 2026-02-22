import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/circles/[id]/swipe/undo - Undo a left swipe
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const circleId = params.id
    const body = await request.json()
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 })
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

    // Check if item is already in a MATCHED trade
    const itemInTrade = await prisma.tradeMember.findFirst({
      where: {
        OR: [
          { givesItemId: itemId },
          { receivesItemId: itemId }
        ],
        trade: {
          circleId,
          status: 'MATCHED'
        }
      }
    })

    if (itemInTrade) {
      return NextResponse.json({ error: "Cannot undo - item is already in a matched trade" }, { status: 400 })
    }

    // Find the LEFT swipe and mark as undone
    const swipe = await prisma.swipe.findUnique({
      where: {
        userId_itemId_circleId: {
          userId: session.user.id,
          itemId,
          circleId
        }
      }
    })

    if (!swipe) {
      return NextResponse.json({ error: "Swipe not found" }, { status: 404 })
    }

    if (swipe.direction !== 'LEFT') {
      return NextResponse.json({ error: "Can only undo LEFT swipes" }, { status: 400 })
    }

    if (swipe.undone) {
      return NextResponse.json({ error: "Swipe already undone" }, { status: 400 })
    }

    await prisma.swipe.update({
      where: {
        userId_itemId_circleId: {
          userId: session.user.id,
          itemId,
          circleId
        }
      },
      data: {
        undone: true
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error undoing swipe:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}