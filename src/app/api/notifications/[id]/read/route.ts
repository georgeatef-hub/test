import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  id: string
}

export async function PATCH(request: NextRequest, { params }: { params: Params }) {
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

    const notificationId = params.id

    // Find the notification and verify it belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (notification.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mark as read
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    })

    return NextResponse.json({ 
      success: true,
      notification: updatedNotification 
    })

  } catch (error) {
    console.error('Mark notification read API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}