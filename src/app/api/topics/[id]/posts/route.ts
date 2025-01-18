import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        postTrees: {
          some: {
            topicId: params.id,
          },
        },
      },
      include: {
        postTrees: {
          where: {
            topicId: params.id,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Failed to fetch topic posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topic posts' },
      { status: 500 }
    )
  }
} 