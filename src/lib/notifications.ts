import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

export async function createNotification(params: {
  userId: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
}) {
  return prisma.notification.create({ 
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data as Prisma.InputJsonValue | undefined
    }
  })
}