import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE /api/circles/[id]/members/[userId] - Remove member
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string; userId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const circleId = params.id
    const targetUserId = params.userId

    // Check if the requester is a member of this circle
    const requesterMembership = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: session.user.id
        }
      }
    })

    if (!requesterMembership) {
      return NextResponse.json({ error: "Not a member of this circle" }, { status: 403 })
    }

    // Cannot remove yourself (use leave instead)
    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: "Cannot remove yourself. Use leave endpoint instead." }, { status: 400 })
    }

    // Check if target user is a member
    const targetMembership = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: targetUserId
        }
      }
    })

    if (!targetMembership) {
      return NextResponse.json({ error: "User is not a member of this circle" }, { status: 404 })
    }

    // Remove the member
    await prisma.circleMember.delete({
      where: {
        circleId_userId: {
          circleId,
          userId: targetUserId
        }
      }
    })

    // Delete all their swipes in this circle
    await prisma.swipe.deleteMany({
      where: {
        circleId,
        userId: targetUserId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}