import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/circles/[id]/leave - Leave circle
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const circleId = params.id

    const membership = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: session.user.id
        }
      }
    })

    if (!membership) {
      return NextResponse.json({ error: "Not a member of this circle" }, { status: 400 })
    }

    const circle = await prisma.circle.findUnique({
      where: { id: circleId },
      include: {
        members: {
          orderBy: { joinedAt: 'asc' }
        }
      }
    })

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 })
    }

    // If this is the admin leaving and there are other members, transfer admin to oldest member
    if (circle.adminId === session.user.id && circle.members.length > 1) {
      const nextAdmin = circle.members.find(member => member.userId !== session.user.id)
      if (nextAdmin) {
        await prisma.circle.update({
          where: { id: circleId },
          data: { adminId: nextAdmin.userId }
        })
      }
    }

    // Remove user from circle
    await prisma.circleMember.delete({
      where: {
        circleId_userId: {
          circleId,
          userId: session.user.id
        }
      }
    })

    // Delete all user's swipes in this circle
    await prisma.swipe.deleteMany({
      where: {
        circleId,
        userId: session.user.id
      }
    })

    // If this was the last member, delete the circle
    if (circle.members.length === 1) {
      await prisma.circle.delete({
        where: { id: circleId }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error leaving circle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}