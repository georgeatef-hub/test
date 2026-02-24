import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  id: string
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

    const itemId = params.id

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Don't allow liking your own items
    if (item.userId === user.id) {
      return NextResponse.json({ error: 'Cannot like your own item' }, { status: 400 })
    }

    // Create or find existing like
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: itemId
        }
      }
    })

    if (existingLike) {
      return NextResponse.json({ error: 'Item already liked' }, { status: 400 })
    }

    // Create like
    await prisma.like.create({
      data: {
        userId: user.id,
        itemId: itemId
      }
    })

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { itemId: itemId }
    })

    return NextResponse.json({ 
      success: true, 
      likeCount,
      isLiked: true 
    })

  } catch (error) {
    console.error('Like API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Params }) {
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

    // Remove like
    const deletedLike = await prisma.like.deleteMany({
      where: {
        userId: user.id,
        itemId: itemId
      }
    })

    if (deletedLike.count === 0) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 })
    }

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { itemId: itemId }
    })

    return NextResponse.json({ 
      success: true, 
      likeCount,
      isLiked: false 
    })

  } catch (error) {
    console.error('Unlike API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}