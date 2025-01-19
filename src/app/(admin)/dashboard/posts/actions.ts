'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { generateId } from '@/lib/utils/ulid'

export async function getPosts(page: number = 1, pageSize: number = 10) {
  const skip = (page - 1) * pageSize

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: {
        postTrees: {
          include: {
            topic: {
              include: {
                categories: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      }
    }),
    prisma.post.count()
  ])

  return {
    data: posts,
    total,
    page,
    pageSize
  }
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: { id },
    })
    revalidatePath('/dashboard/posts')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete post:', error)
    return { success: false, error: 'Failed to delete post' }
  }
}

export async function deletePosts(ids: string[]) {
  try {
    await prisma.post.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
    revalidatePath('/dashboard/posts')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete posts:', error)
    return { success: false, error: 'Failed to delete posts' }
  }
}

export async function updatePostStatus(id: string, published: boolean) {
  try {
    await prisma.post.update({
      where: { id },
      data: { published },
    })
    revalidatePath('/dashboard/posts')
    return { success: true }
  } catch (error) {
    console.error('Failed to update post status:', error)
    return { success: false, error: 'Failed to update post status' }
  }
}

export async function createPost(data: {
  title: string
  content: string
  description?: string
  published?: boolean
  topicIds?: string[]
}) {
  try {
    const postId = generateId()
    const post = await prisma.post.create({
      data: {
        id: postId,
        ...data,
        postTrees: data.topicIds ? {
          create: data.topicIds.map((topicId) => ({
            id: generateId(),
            topicId,
            order: 0,
          })),
        } : undefined,
      },
      include: {
        postTrees: {
          include: {
            topic: {
              include: {
                categories: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    revalidatePath('/dashboard/posts')
    return { success: true, data: post }
  } catch (error) {
    console.error('Failed to create post:', error)
    return { success: false, error: 'Failed to create post' }
  }
} 