import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { runMatchingAlgorithm } from "@/lib/matching"

// POST /api/circles/[id]/match - Run matching algorithm for a circle
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Verify circle exists
    const circle = await prisma.circle.findUnique({
      where: { id: circleId }
    })

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 })
    }

    // Run the matching algorithm
    const result = await runMatchingAlgorithm(circleId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error running matching algorithm:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}