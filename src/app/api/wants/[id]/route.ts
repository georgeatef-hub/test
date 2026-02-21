import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const wantId = params.id

    // Check if the want exists and belongs to the user
    const want = await prisma.want.findUnique({
      where: { id: wantId }
    })

    if (!want) {
      return NextResponse.json({ error: "Want not found" }, { status: 404 })
    }

    if (want.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own wants" },
        { status: 403 }
      )
    }

    // Delete the want
    await prisma.want.delete({
      where: { id: wantId }
    })

    return NextResponse.json({ message: "Want removed successfully" })

  } catch (error) {
    console.error("Error removing want:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}