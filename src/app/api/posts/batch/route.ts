import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const batchDeleteSchema = z.object({
  ids: z.array(z.string()),
})

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ids } = batchDeleteSchema.parse(body)

    // 检查所有要删除的文章是否都属于当前用户
    const posts = await prisma.post.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    })

    const unauthorizedPosts = posts.filter(post => post.authorId !== session.user.id)
    if (unauthorizedPosts.length > 0) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    await prisma.post.deleteMany({
      where: {
        id: {
          in: ids,
        },
        authorId: session.user.id, // 确保只删除当前用户的文章
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to delete posts:', error)
    return NextResponse.json(
      { error: 'Failed to delete posts' },
      { status: 500 }
    )
  }
} 