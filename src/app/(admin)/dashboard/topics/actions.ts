'use server'

import { z } from 'zod'
import { ulid } from 'ulid'
import prisma from '@/lib/prisma'
import type { Topic, Category } from '@prisma/client'

const topicSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, '请选择至少一个分类'),
})

export type TopicFormData = z.infer<typeof topicSchema>

export interface TopicWithCategories extends Topic {
  categories: Category[]
  _count: {
    postTrees: number
  }
}

export async function getTopics(): Promise<TopicWithCategories[]> {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        categories: true,
        _count: {
          select: {
            postTrees: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    })

    return topics
  } catch (error) {
    console.error('Error fetching topics:', error)
    throw new Error('Failed to fetch topics')
  }
}

export async function createTopic(data: TopicFormData): Promise<TopicWithCategories> {
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
      _count: {
        select: {
          postTrees: true
        }
      }
    },
  })
}

export async function updateTopic(data: TopicFormData & { id: string }): Promise<TopicWithCategories> {
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
      _count: {
        select: {
          postTrees: true
        }
      }
    },
  })
}

export async function deleteTopic(id: string) {
  return prisma.topic.delete({
    where: { id },
  })
} 