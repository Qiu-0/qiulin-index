import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateId } from '@/lib/utils/ulid'
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  description: z.string().optional(),
  published: z.boolean().optional().default(false),
  topicIds: z.array(z.string()).optional(),
})

async function cleanupOrphanedPostTrees() {
  try {
    // 找出所有有效的主题 ID
    const topics = await prisma.topic.findMany({
      select: { id: true }
    })
    const validTopicIds = topics.map(t => t.id)

    // 删除所有引用不存在主题的 TopicPostTree 记录
    await prisma.topicPostTree.deleteMany({
      where: {
        topicId: {
          notIn: validTopicIds
        }
      }
    })
  } catch (error) {
    console.error('Failed to cleanup orphaned post trees:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    // 先清理无效数据
    await cleanupOrphanedPostTrees()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    const [total, posts] = await Promise.all([
      prisma.post.count(),
      prisma.post.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
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
      }),
    ])
    
    return NextResponse.json({
      data: posts,
      total,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = postSchema.parse(body)
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

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
} 