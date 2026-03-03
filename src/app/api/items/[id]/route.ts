import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ItemCondition } from "@prisma/client"

// GET /api/items/[id] - Item detail
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const itemId = params.id

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Count likes and wants
    const [likeCount, wantCount, commentCount, isLiked, isWanted] = await Promise.all([
      prisma.like.count({ where: { itemId } }),
      prisma.swipe.count({ where: { itemId, direction: 'RIGHT' } }),
      prisma.comment.count({ where: { itemId } }),
      prisma.like.findFirst({ where: { itemId, userId: session.user.id } }).then(Boolean),
      prisma.swipe.findFirst({ where: { itemId, userId: session.user.id, direction: 'RIGHT' } }).then(Boolean),
    ])

    // Get comments
    const comments = await prisma.comment.findMany({
      where: { itemId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      ...item,
      likeCount,
      wantCount,
      commentCount,
      isLikedByCurrentUser: isLiked,
      isWantedByCurrentUser: isWanted,
      comments,
      isOwner: item.userId === session.user.id,
    })
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/items/[id] - Update item
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const itemId = params.id
    const body = await request.json()
    const { title, description, condition, tags, images } = body

    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only update your own items" }, { status: 403 })
    }

    if (item.status !== 'ACTIVE') {
      return NextResponse.json({ error: "Can only update active items" }, { status: 400 })
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(condition && { condition: condition as ItemCondition }),
        ...(tags && { tags }),
        ...(images && { images })
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Error updating item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/items/[id] - Remove item (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const itemId = params.id

    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: "You can only delete your own items" }, { status: 403 })
    }

    // Soft delete - set status to REMOVED
    await prisma.item.update({
      where: { id: itemId },
      data: { status: 'REMOVED' }
    })

    // Delete all swipes on this item
    await prisma.swipe.deleteMany({
      where: { itemId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}