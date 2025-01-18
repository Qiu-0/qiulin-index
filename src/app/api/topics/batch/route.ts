import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { isValidUlid } from '@/lib/utils/ulid'

const batchDeleteSchema = z.object({
  ids: z.array(z.string()),
})

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = batchDeleteSchema.parse(body)

    // 验证所有 ID 是否有效
    if (!ids.every(isValidUlid)) {
      return NextResponse.json(
        { error: 'Invalid topic ID' },
        { status: 400 }
      )
    }

    // 批量删除主题
    await prisma.topic.deleteMany({
      where: {
        id: {
          in: ids,
        },
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

    console.error('Failed to delete topics:', error)
    return NextResponse.json(
      { error: 'Failed to delete topics' },
      { status: 500 }
    )
  }
} 