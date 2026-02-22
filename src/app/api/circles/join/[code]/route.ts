import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/circles/join/[code] - Lookup circle by invite code
export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const inviteCode = params.code

    const circle = await prisma.circle.findUnique({
      where: { inviteCode },
      include: {
        admin: {
          select: { name: true }
        },
        _count: {
          select: { members: true }
        }
      }
    })

    if (!circle) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 })
    }

    return NextResponse.json({
      id: circle.id,
      name: circle.name,
      description: circle.description,
      memberCount: circle._count.members,
      adminName: circle.admin.name
    })
  } catch (error) {
    console.error("Error looking up invite code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}