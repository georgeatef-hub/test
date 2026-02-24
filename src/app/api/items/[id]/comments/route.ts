import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  id: string
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const itemId = params.id

    // Check if item exists and get owner info
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { user: true }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if user shares circles with item owner
    const sharedCircles = await prisma.circle.findMany({
      where: {
        members: {
          some: { userId: user.id }
        },
        AND: {
          members: {
            some: { userId: item.userId }
          }
        }
      }
    })

    if (sharedCircles.length === 0 && item.userId !== user.id) {
      return NextResponse.json({ error: 'No access to this item' }, { status: 403 })
    }

    // Get comments with user info
    const comments = await prisma.comment.findMany({
      where: { itemId: itemId },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ comments })

  } catch (error) {
    console.error('Get comments API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { text } = await request.json()
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
    }

    if (text.trim().length > 500) {
      return NextResponse.json({ error: 'Comment too long (max 500 characters)' }, { status: 400 })
    }

    const itemId = params.id

    // Check if item exists and get owner info
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { user: true }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if user shares circles with item owner
    const sharedCircles = await prisma.circle.findMany({
      where: {
        members: {
          some: { userId: user.id }
        },
        AND: {
          members: {
            some: { userId: item.userId }
          }
        }
      }
    })

    if (sharedCircles.length === 0 && item.userId !== user.id) {
      return NextResponse.json({ error: 'No access to comment on this item' }, { status: 403 })
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        text: text.trim(),
        userId: user.id,
        itemId: itemId
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    // Get updated comment count
    const commentCount = await prisma.comment.count({
      where: { itemId: itemId }
    })

    return NextResponse.json({ 
      comment,
      commentCount,
      success: true 
    })

  } catch (error) {
    console.error('Create comment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}