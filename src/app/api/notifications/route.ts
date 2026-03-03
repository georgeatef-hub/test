import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

    // Fetch notifications ordered by createdAt desc, limit 50
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: { 
        userId: user.id,
        read: false 
      }
    })

    return NextResponse.json({ 
      notifications,
      unreadCount 
    })

  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}