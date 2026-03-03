import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
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

    // Mark all user's notifications as read
    const result = await prisma.notification.updateMany({
      where: { 
        userId: user.id,
        read: false
      },
      data: { read: true }
    })

    return NextResponse.json({ 
      success: true,
      updatedCount: result.count
    })

  } catch (error) {
    console.error('Mark all notifications read API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}