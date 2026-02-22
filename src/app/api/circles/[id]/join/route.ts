import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/circles/[id]/join - Join circle by ID
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const circleId = params.id
    const body = await request.json()
    const { inviteCode } = body

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
    }

    const circle = await prisma.circle.findUnique({
      where: { id: circleId }
    })

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 })
    }

    if (circle.inviteCode !== inviteCode) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 400 })
    }

    // Check if already a member
    const existingMembership = await prisma.circleMember.findUnique({
      where: {
        circleId_userId: {
          circleId,
          userId: session.user.id
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json({ error: "Already a member of this circle" }, { status: 400 })
    }

    // Add user as member
    await prisma.circleMember.create({
      data: {
        circleId,
        userId: session.user.id
      }
    })

    // Return updated circle info
    const updatedCircle = await prisma.circle.findUnique({
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
          }
        }
      }
    })

    return NextResponse.json(updatedCircle)
  } catch (error) {
    console.error("Error joining circle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}