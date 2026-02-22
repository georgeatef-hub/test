import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/trades/[id] - Trade detail
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tradeId = params.id

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        circle: {
          select: { id: true, name: true, description: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, image: true }
            },
            givesItem: {
              select: { 
                id: true, 
                title: true, 
                description: true, 
                images: true, 
                condition: true, 
                tags: true 
              }
            },
            receivesItem: {
              select: { 
                id: true, 
                title: true, 
                description: true, 
                images: true, 
                condition: true, 
                tags: true 
              }
            }
          }
        }
      }
    })

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 })
    }

    // Check if user is a participant
    const isParticipant = trade.members.some(member => member.userId === session.user.id)
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden - Not a participant in this trade" }, { status: 403 })
    }

    return NextResponse.json(trade)
  } catch (error) {
    console.error("Error fetching trade detail:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}