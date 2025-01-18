import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const batchDeleteSchema = z.object({
  ids: z.array(z.string()),
})

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = batchDeleteSchema.parse(body)

    await prisma.category.deleteMany({
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

    console.error('Failed to delete categories:', error)
    return NextResponse.json(
      { error: 'Failed to delete categories' },
      { status: 500 }
    )
  }
} 