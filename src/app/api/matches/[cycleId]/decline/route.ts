import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TradeCycleStatus } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { cycleId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cycleId = params.cycleId

    // Find the user's trade member record for this cycle
    const tradeMember = await prisma.tradeMember.findUnique({
      where: {
        cycleId_userId: {
          cycleId: cycleId,
          userId: session.user.id
        }
      },
      include: {
        cycle: true
      }
    })

    if (!tradeMember) {
      return NextResponse.json(
        { error: "You are not part of this trade cycle" },
        { status: 404 }
      )
    }

    if (tradeMember.cycle.status !== TradeCycleStatus.PENDING) {
      return NextResponse.json(
        { error: "This trade cycle is no longer pending" },
        { status: 400 }
      )
    }

    // Cancel the entire trade cycle
    await prisma.tradeCycle.update({
      where: { id: cycleId },
      data: { status: TradeCycleStatus.CANCELLED }
    })

    return NextResponse.json({
      message: "Trade declined. The trade cycle has been cancelled."
    })

  } catch (error) {
    console.error("Error declining trade:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}