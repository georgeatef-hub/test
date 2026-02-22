import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/trades - List my trades
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const trades = await prisma.trade.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        circle: {
          select: { id: true, name: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            },
            givesItem: {
              select: { id: true, title: true, images: true, condition: true }
            },
            receivesItem: {
              select: { id: true, title: true, images: true, condition: true }
            }
          }
        }
      },
      orderBy: { matchedAt: 'desc' }
    })

    return NextResponse.json(trades)
  } catch (error) {
    console.error("Error fetching trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}