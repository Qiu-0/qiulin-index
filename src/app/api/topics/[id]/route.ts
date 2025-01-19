import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { z } from 'zod'

const topicSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
        categories: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // 获取主题下的文章树结构
    const postTrees = await prisma.topicPostTree.findMany({
      where: {
        topicId: params.id,
        parentId: null // 只获取顶层节点
      },
      select: {
        id: true,
        order: true,
        post: {
          select: {
            id: true,
            title: true,
          }
        },
        children: {
          select: {
            id: true,
            order: true,
            post: {
              select: {
                id: true,
                title: true,
              }
            },
            children: {
              select: {
                id: true,
                order: true,
                post: {
                  select: {
                    id: true,
                    title: true,
                  }
                }
              },
              orderBy: {
                order: "asc"
              }
            }
          },
          orderBy: {
            order: "asc"
          }
        }
      },
      orderBy: {
        order: "asc"
      }
    })

    return NextResponse.json({ topic, postTrees })
  } catch (error) {
    console.error('Failed to fetch topic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = topicSchema.parse(body)
    const { categoryIds, ...topicData } = validatedData

    const topic = await prisma.topic.update({
      where: { id: params.id },
      data: {
        ...topicData,
        categories: {
          set: categoryIds ? categoryIds.map(id => ({ id })) : [],
        },
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(topic)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to update topic:', error)
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.topic.delete({
      where: { id: params.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete topic:', error)
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const topic = await prisma.topic.update({
      where: {
        id: params.id
      },
      data
    })

    return NextResponse.json(topic)
  } catch (error) {
    console.error('Error updating topic:', error)
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    )
  }
} 