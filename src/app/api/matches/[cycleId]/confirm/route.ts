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
        cycle: {
          include: {
            members: true
          }
        }
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

    // Confirm this user's participation
    await prisma.tradeMember.update({
      where: {
        id: tradeMember.id
      },
      data: {
        confirmed: true
      }
    })

    // Check if all members have confirmed
    const allMembers = await prisma.tradeMember.findMany({
      where: {
        cycleId: cycleId
      }
    })

    const allConfirmed = allMembers.every(member => member.confirmed)

    if (allConfirmed) {
      // Update cycle status to CONFIRMED
      await prisma.tradeCycle.update({
        where: { id: cycleId },
        data: { status: TradeCycleStatus.CONFIRMED }
      })

      return NextResponse.json({
        message: "Trade confirmed! All participants have agreed.",
        allConfirmed: true
      })
    }

    return NextResponse.json({
      message: "Your participation confirmed. Waiting for other participants.",
      allConfirmed: false
    })

  } catch (error) {
    console.error("Error confirming trade:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}