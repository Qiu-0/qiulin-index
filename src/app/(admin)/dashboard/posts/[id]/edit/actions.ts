'use server'

import prisma from '@/lib/prisma'
import { Prisma, PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { generateId } from '@/lib/utils/ulid'

export interface PostForm {
  title: string
  content: string
  description?: string
  published?: boolean
  topicIds?: string[]
}

// 获取文章详情
export async function getPost(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      postTrees: {
        include: {
          topic: {
            include: {
              categories: true
            }
          }
        }
      }
    }
  })
  return post
}

// 获取所有主题
export async function getTopics() {
  const topics = await prisma.topic.findMany({
    select: {
      id: true,
      title: true,
      description: true
    },
    take: 100,
    orderBy: { createdAt: 'desc' }
  })
  return topics
}

// 创建或更新文章
export async function upsertPost(id: string, data: PostForm) {
  const { topicIds = [], ...postData } = data
  const isNew = id === 'new'
  const postId = isNew ? generateId() : id

  const result = await prisma.$transaction(async (tx) => {
    // 创建或更新文章
    const post = await tx.post.upsert({
      where: { id: postId },
      create: {
        id: postId,
        ...postData
      },
      update: postData
    })

    // 如果是更新，先删除原有的主题关联
    if (!isNew) {
      await tx.topicPostTree.deleteMany({
        where: { postId }
      })
    }

    // 创建新的主题关联
    if (topicIds.length > 0) {
      await tx.topicPostTree.createMany({
        data: topicIds.map(topicId => ({
          id: generateId(),
          postId,
          topicId,
          order: 0
        }))
      })
    }

    return post
  })

  revalidatePath('/dashboard/posts')
  return result
} 