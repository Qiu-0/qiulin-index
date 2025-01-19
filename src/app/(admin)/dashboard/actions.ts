'use server'

import prisma from '@/lib/prisma'
import { generateId } from "@/lib/utils/ulid"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const categorySchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
})

const topicSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
})

const postSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  description: z.string().optional(),
  published: z.boolean().optional().default(false),
  topicIds: z.array(z.string()).optional(),
})

// 分类相关操作
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { categories }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    throw new Error('Failed to fetch categories')
  }
}

export async function createCategory(data: z.infer<typeof categorySchema>) {
  try {
    const validatedData = categorySchema.parse(data)
    const category = await prisma.category.create({
      data: {
        id: generateId(),
        ...validatedData,
      }
    })
    revalidatePath('/dashboard/categories')
    return { category }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }
    console.error('Failed to create category:', error)
    throw new Error('Failed to create category')
  }
}

export async function updateCategory(id: string, data: z.infer<typeof categorySchema>) {
  try {
    const validatedData = categorySchema.parse(data)
    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    })
    revalidatePath('/dashboard/categories')
    return { category }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }
    console.error('Failed to update category:', error)
    throw new Error('Failed to update category')
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    })
    revalidatePath('/dashboard/categories')
  } catch (error) {
    console.error('Failed to delete category:', error)
    throw new Error('Failed to delete category')
  }
}

export async function batchDeleteCategories(ids: string[]) {
  try {
    await prisma.category.deleteMany({
      where: {
        id: { in: ids }
      }
    })
    revalidatePath('/dashboard/categories')
  } catch (error) {
    console.error('Failed to batch delete categories:', error)
    throw new Error('Failed to batch delete categories')
  }
}

// 主题相关操作
export async function getTopics() {
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
        createdAt: 'desc'
      }
    })
    return { topics }
  } catch (error) {
    console.error('Failed to fetch topics:', error)
    throw new Error('Failed to fetch topics')
  }
}

export async function getTopic(id: string) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        categories: true,
      }
    })
    if (!topic) return null
    return { topic }
  } catch (error) {
    console.error('Failed to fetch topic:', error)
    throw new Error('Failed to fetch topic')
  }
}

export async function createTopic(data: z.infer<typeof topicSchema>) {
  try {
    const validatedData = topicSchema.parse(data)
    const { categoryIds, ...topicData } = validatedData

    const topic = await prisma.topic.create({
      data: {
        id: generateId(),
        ...topicData,
        categories: categoryIds ? {
          connect: categoryIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        categories: true,
      }
    })
    revalidatePath('/dashboard/topics')
    return { topic }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }
    console.error('Failed to create topic:', error)
    throw new Error('Failed to create topic')
  }
}

export async function updateTopic(id: string, data: z.infer<typeof topicSchema>) {
  try {
    const validatedData = topicSchema.parse(data)
    const { categoryIds, ...topicData } = validatedData

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        ...topicData,
        categories: {
          set: categoryIds ? categoryIds.map(id => ({ id })) : [],
        },
      },
      include: {
        categories: true,
      }
    })
    revalidatePath('/dashboard/topics')
    return { topic }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }
    console.error('Failed to update topic:', error)
    throw new Error('Failed to update topic')
  }
}

export async function deleteTopic(id: string) {
  try {
    await prisma.topic.delete({
      where: { id },
    })
    revalidatePath('/dashboard/topics')
  } catch (error) {
    console.error('Failed to delete topic:', error)
    throw new Error('Failed to delete topic')
  }
}

export async function batchDeleteTopics(ids: string[]) {
  try {
    await prisma.topic.deleteMany({
      where: {
        id: { in: ids }
      }
    })
    revalidatePath('/dashboard/topics')
  } catch (error) {
    console.error('Failed to batch delete topics:', error)
    throw new Error('Failed to batch delete topics')
  }
}

// 博客相关操作
export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        postTrees: {
          include: {
            topic: {
              include: {
                categories: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { posts }
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    throw new Error('Failed to fetch posts')
  }
}

export async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postTrees: {
          include: {
            topic: true,
          }
        }
      }
    })
    if (!post) return null
    return { post }
  } catch (error) {
    console.error('Failed to fetch post:', error)
    throw new Error('Failed to fetch post')
  }
}

export async function createPost(data: z.infer<typeof postSchema>) {
  try {
    const validatedData = postSchema.parse(data)
    const { topicIds, ...postData } = validatedData

    const postId = generateId()
    const post = await prisma.post.create({
      data: {
        id: postId,
        ...postData,
        postTrees: topicIds ? {
          create: topicIds.map((topicId) => ({
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
                categories: true,
              }
            }
          }
        }
      }
    })
    revalidatePath('/dashboard/posts')
    return { post }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }
    console.error('Failed to create post:', error)
    throw new Error('Failed to create post')
  }
}

export async function updatePost(id: string, data: z.infer<typeof postSchema>) {
  try {
    const validatedData = postSchema.parse(data)
    const { topicIds, ...postData } = validatedData

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...postData,
        postTrees: topicIds ? {
          deleteMany: {},
          create: topicIds.map(topicId => ({
            id: generateId(),
            topicId,
          })),
        } : undefined,
      },
      include: {
        postTrees: {
          include: {
            topic: {
              include: {
                categories: true,
              }
            }
          }
        }
      }
    })
    revalidatePath('/dashboard/posts')
    return { post }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message)
    }
    console.error('Failed to update post:', error)
    throw new Error('Failed to update post')
  }
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: { id },
    })
    revalidatePath('/dashboard/posts')
  } catch (error) {
    console.error('Failed to delete post:', error)
    throw new Error('Failed to delete post')
  }
}

export async function batchDeletePosts(ids: string[]) {
  try {
    await prisma.post.deleteMany({
      where: {
        id: { in: ids }
      }
    })
    revalidatePath('/dashboard/posts')
  } catch (error) {
    console.error('Failed to batch delete posts:', error)
    throw new Error('Failed to batch delete posts')
  }
}

// 主题文章树相关操作
export async function getTopicPostTrees(topicId: string) {
  try {
    const postTrees = await prisma.topicPostTree.findMany({
      where: {
        topicId,
        parentId: null // 只获取顶层节点
      },
      include: {
        post: true,
        children: {
          include: {
            post: true,
            children: {
              include: {
                post: true
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })
    return { postTrees }
  } catch (error) {
    console.error('Failed to fetch topic post trees:', error)
    throw new Error('Failed to fetch topic post trees')
  }
}

export async function updateTopicPostTree(
  topicId: string,
  data: { id: string; parentId: string | null; order: number }[]
) {
  try {
    await prisma.$transaction(
      data.map(({ id, parentId, order }) =>
        prisma.topicPostTree.update({
          where: { id },
          data: { parentId, order }
        })
      )
    )
    revalidatePath(`/dashboard/topics/${topicId}`)
  } catch (error) {
    console.error('Failed to update topic post tree:', error)
    throw new Error('Failed to update topic post tree')
  }
}

export async function getDashboardStats() {
  try {
    const [postCount, topicCount] = await Promise.all([
      prisma.post.count(),
      prisma.topic.count(),
    ])
    return { postCount, topicCount }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    throw new Error('Failed to fetch dashboard stats')
  }
} 