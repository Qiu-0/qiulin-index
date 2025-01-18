import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        categories: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json({
      data: topics,
      total: topics.length
    })
  } catch (error) {
    console.error('Failed to fetch topics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
} 