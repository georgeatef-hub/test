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

    const itemId = params.id

    // Check if the item exists and belongs to the user
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (item.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own items" },
        { status: 403 }
      )
    }

    // Delete the item (this will cascade delete wants)
    await prisma.item.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ message: "Item deleted successfully" })

  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}