import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/trades/[id]/complete - Mark my part as complete
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tradeId = params.id

    // Find the user's trade member record
    const tradeMember = await prisma.tradeMember.findUnique({
      where: {
        tradeId_userId: {
          tradeId,
          userId: session.user.id
        }
      }
    })

    if (!tradeMember) {
      return NextResponse.json({ error: "Not a participant in this trade" }, { status: 403 })
    }

    if (tradeMember.completedAt) {
      return NextResponse.json({ error: "Already marked as complete" }, { status: 400 })
    }

    // Mark this member as completed
    await prisma.tradeMember.update({
      where: {
        tradeId_userId: {
          tradeId,
          userId: session.user.id
        }
      },
      data: {
        completedAt: new Date()
      }
    })

    // Check if ALL members have completed
    const allMembers = await prisma.tradeMember.findMany({
      where: { tradeId }
    })

    const allCompleted = allMembers.every(member => member.completedAt !== null)

    if (allCompleted) {
      // Update trade status to COMPLETED
      await prisma.trade.update({
        where: { id: tradeId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      // Mark all traded items as TRADED status and set tradedAt
      const itemIds = allMembers.map(member => member.givesItemId)
      await prisma.item.updateMany({
        where: {
          id: { in: itemIds }
        },
        data: {
          status: 'TRADED',
          tradedAt: new Date()
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      allCompleted,
      message: allCompleted ? "Trade completed by all participants!" : "Your part marked as complete"
    })
  } catch (error) {
    console.error("Error completing trade:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}