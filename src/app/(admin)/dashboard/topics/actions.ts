'use server'

import { z } from 'zod'
import { ulid } from 'ulid'
import prisma from '@/lib/prisma'

const topicSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, '请选择至少一个分类'),
})

export type TopicFormData = z.infer<typeof topicSchema>

export async function createTopic(data: TopicFormData) {
  const validated = topicSchema.parse(data)
  return prisma.topic.create({
    data: {
      id: ulid(),
      title: validated.title,
      description: validated.description,
      categories: {
        connect: validated.categoryIds.map(id => ({ id })),
      },
    },
    include: {
      categories: true,
    },
  })
}

export async function updateTopic(data: TopicFormData & { id: string }) {
  const { id, ...rest } = data
  const validated = topicSchema.parse(rest)
  return prisma.topic.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description,
      categories: {
        set: validated.categoryIds.map(id => ({ id })),
      },
    },
    include: {
      categories: true,
    },
  })
}

export async function deleteTopic(id: string) {
  return prisma.topic.delete({
    where: { id },
  })
} 