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

    // Find all trade cycles where the user is a participant
    const tradeMembers = await prisma.tradeMember.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        cycle: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    city: true,
                  }
                },
                givesItem: {
                  include: {
                    category: true
                  }
                },
                receivesItem: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        },
        givesItem: {
          include: {
            category: true
          }
        },
        receivesItem: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        cycle: {
          createdAt: 'desc'
        }
      }
    })

    return NextResponse.json(tradeMembers)

  } catch (error) {
    console.error("Error fetching matches:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}