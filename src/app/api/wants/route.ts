import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const wants = await prisma.want.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        item: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                city: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(wants)

  } catch (error) {
    console.error("Error fetching wants:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      )
    }

    // Check if the item exists and is available
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Prevent users from wanting their own items
    if (item.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot want your own items" },
        { status: 400 }
      )
    }

    // Check if already wanting this item
    const existingWant = await prisma.want.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId: itemId
        }
      }
    })

    if (existingWant) {
      return NextResponse.json(
        { error: "You are already wanting this item" },
        { status: 400 }
      )
    }

    const want = await prisma.want.create({
      data: {
        userId: session.user.id,
        itemId: itemId,
      },
      include: {
        item: {
          include: {
            category: true,
            user: {
              select: {
                id: true,
                name: true,
                city: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json(want)

  } catch (error) {
    console.error("Error creating want:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}