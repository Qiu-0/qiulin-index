import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postTrees = await prisma.topicPostTree.findMany({
      where: {
        topicId: params.id
      },
      include: {
        post: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(postTrees)
  } catch (error) {
    console.error('Error fetching post tree:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post tree' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { parentId, order } = await request.json()

    const updatedTree = await prisma.topicPostTree.update({
      where: {
        id: params.id
      },
      data: {
        parentId,
        order
      }
    })

    return NextResponse.json(updatedTree)
  } catch (error) {
    console.error('Error updating post tree:', error)
    return NextResponse.json(
      { error: 'Failed to update post tree' },
      { status: 500 }
    )
  }
} 