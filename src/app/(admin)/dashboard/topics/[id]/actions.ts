'use server'

import { z } from 'zod'
import { ulid } from 'ulid'
import prisma from '@/lib/prisma'
import { Post, Topic, TopicPostTree } from '@prisma/client'

const postSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  content: z.string().min(1, '内容不能为空'),
  topicId: z.string().optional(),
})

export type PostFormData = z.infer<typeof postSchema>

export type PostWithTree = Post & {
  postTrees: TopicPostTree[]
}

export async function getTopic(id: string): Promise<Topic> {
  const topic = await prisma.topic.findUnique({
    where: { id }
  })
  if (!topic) throw new Error('主题不存在')
  return topic
}

export async function getTopicPosts(topicId: string): Promise<PostWithTree[]> {
  return prisma.post.findMany({
    where: {
      postTrees: {
        some: {
          topicId
        }
      }
    },
    include: {
      postTrees: {
        where: {
          topicId
        }
      }
    }
  })
}

export async function createPost(data: PostFormData & { topicId: string }) {
  const validated = postSchema.parse(data)
  const post = await prisma.post.create({
    data: {
      id: ulid(),
      title: validated.title,
      description: validated.description,
      content: validated.content,
      postTrees: {
        create: {
          id: ulid(),
          topicId: data.topicId,
          order: 0
        }
      }
    },
    include: {
      postTrees: true
    }
  })
  return post
}

export async function updatePost(data: PostFormData & { id: string }) {
  const { id, ...rest } = data
  const validated = postSchema.parse(rest)
  return prisma.post.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description,
      content: validated.content,
    },
    include: {
      postTrees: true
    }
  })
}

export async function deletePost(id: string) {
  return prisma.post.delete({
    where: { id },
    include: {
      postTrees: true
    }
  })
}

export interface UpdateTopicPostTreeData {
  topicId: string
  postId: string
  parentId: string | null
  order: number
}

export async function updateTopicPostTree(data: UpdateTopicPostTreeData) {
  const { topicId, postId, parentId, order } = data
  
  // 先删除原有的关联
  await prisma.topicPostTree.deleteMany({
    where: {
      topicId,
      postId
    }
  })

  // 创建新的关联
  return prisma.topicPostTree.create({
    data: {
      id: ulid(),
      topicId,
      postId,
      parentId,
      order
    }
  })
} 