import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

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

    // Check if item exists and get owner info
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { user: true }
    })

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Don't allow wanting your own items
    if (item.userId === user.id) {
      return NextResponse.json({ error: 'Cannot want your own item' }, { status: 400 })
    }

    // Find shared circles between current user and item owner
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

    if (sharedCircles.length === 0) {
      return NextResponse.json({ error: 'No shared circles with item owner' }, { status: 400 })
    }

    // Use the first shared circle for the swipe
    const circleId = sharedCircles[0].id

    // Check if already wanted (swiped right) in this circle
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        userId_itemId_circleId: {
          userId: user.id,
          itemId: itemId,
          circleId: circleId
        }
      }
    })

    if (existingSwipe && existingSwipe.direction === 'RIGHT' && !existingSwipe.undone) {
      return NextResponse.json({ error: 'Item already wanted' }, { status: 400 })
    }

    // If there was a LEFT swipe or undone RIGHT swipe, update it
    if (existingSwipe) {
      await prisma.swipe.update({
        where: { id: existingSwipe.id },
        data: {
          direction: 'RIGHT',
          undone: false,
          createdAt: new Date() // Update timestamp for algorithm
        }
      })
    } else {
      // Create new RIGHT swipe (this feeds the matching algorithm)
      await prisma.swipe.create({
        data: {
          userId: user.id,
          itemId: itemId,
          circleId: circleId,
          direction: 'RIGHT'
        }
      })
    }

    // Create notification for item owner
    await createNotification({
      userId: item.userId, // item owner
      type: 'want',
      title: 'Someone wants your item!',
      body: `${user.name} wants your "${item.title}"`,
      data: { itemId: item.id, fromUserId: user.id }
    })

    // Get updated want count (count of RIGHT swipes)
    const wantCount = await prisma.swipe.count({
      where: { 
        itemId: itemId,
        direction: 'RIGHT',
        undone: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      wantCount,
      isWanted: true,
      message: 'Added to your wants - feeding the matching algorithm!' 
    })

  } catch (error) {
    console.error('Want API error:', error)
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

    // Find and undo all RIGHT swipes by this user for this item
    const rightSwipes = await prisma.swipe.findMany({
      where: {
        userId: user.id,
        itemId: itemId,
        direction: 'RIGHT',
        undone: false
      }
    })

    if (rightSwipes.length === 0) {
      return NextResponse.json({ error: 'Item not wanted' }, { status: 404 })
    }

    // Mark swipes as undone (preserves data for algorithm but removes from want count)
    await prisma.swipe.updateMany({
      where: {
        userId: user.id,
        itemId: itemId,
        direction: 'RIGHT',
        undone: false
      },
      data: { undone: true }
    })

    // Get updated want count (count of active RIGHT swipes)
    const wantCount = await prisma.swipe.count({
      where: { 
        itemId: itemId,
        direction: 'RIGHT',
        undone: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      wantCount,
      isWanted: false 
    })

  } catch (error) {
    console.error('Unwant API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}