import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ItemCondition } from "@prisma/client"

// POST /api/items - Create item (bait)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, condition, tags, images } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    const item = await prisma.item.create({
      data: {
        userId: session.user.id,
        title,
        description: description || null,
        condition: condition as ItemCondition || null,
        tags: tags || [],
        images
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/items - List my items
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const items = await prisma.item.findMany({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        },
        _count: {
          select: {
            swipes: {
              where: { direction: 'RIGHT' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const itemsWithSwipeCount = items.map(item => ({
      ...item,
      _count: item._count.swipes
    }))

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return NextResponse.json(itemsWithSwipeCount.map(({ _count, ...item }) => item))
  } catch (error) {
    console.error("Error fetching items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}