import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const topicSchema = z.object({
  id: z.string(),
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const skip = (page - 1) * pageSize

    const [total, topics] = await Promise.all([
      prisma.topic.count(),
      prisma.topic.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      data: topics,
      total,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Failed to fetch topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = topicSchema.parse(body)
    const { categoryIds, ...topicData } = validatedData

    const topic = await prisma.topic.create({
      data: {
        ...topicData,
        categories: categoryIds ? {
          connect: categoryIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        categories: {
          select: {
            id: true,
            name: true,
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

    console.error('Failed to create topic:', error)
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    )
  }
} 