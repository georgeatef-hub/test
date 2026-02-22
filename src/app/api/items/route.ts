import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ItemStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const excludeOwn = searchParams.get('excludeOwn') === 'true'
    const mode = searchParams.get('mode') // 'swipe' mode

    const where: any = {
      status: ItemStatus.AVAILABLE,
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (excludeOwn) {
      where.userId = {
        not: session.user.id
      }
    }

    // For swipe mode: exclude items already wanted by this user
    if (mode === 'swipe') {
      where.userId = { not: session.user.id } // Always exclude own items in swipe
      where.wantedBy = {
        none: {
          userId: session.user.id
        }
      }
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            city: true,
          }
        },
        wantedBy: {
          where: {
            userId: session.user.id
          }
        },
        _count: {
          select: {
            wantedBy: true
          }
        }
      },
      orderBy: mode === 'swipe' 
        ? [{ createdAt: 'desc' }] // Random-ish for swipe mode - could implement true randomization
        : { createdAt: 'desc' }
    })

    // Add wantCount to each item for easier access
    const itemsWithWantCount = items.map(item => ({
      ...item,
      wantCount: item._count.wantedBy
    }))

    return NextResponse.json(itemsWithWantCount)

  } catch (error) {
    console.error("Error fetching items:", error)
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

    const { title, description, categoryId, condition, images } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    const item = await prisma.item.create({
      data: {
        title,
        description: description || null,
        categoryId: categoryId || null,
        condition: condition || null,
        images: images || [],
        userId: session.user.id,
      },
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
    })

    return NextResponse.json(item)

  } catch (error) {
    console.error("Error creating item:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}