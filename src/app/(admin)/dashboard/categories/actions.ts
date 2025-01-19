'use server'

import { z } from 'zod'
import { ulid } from 'ulid'
import prisma from '@/lib/prisma'

const categorySchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export async function getCategories(pageSize: number = 10, page: number = 1) {
  try {
    const skip = (page - 1) * pageSize

    const [total, categories] = await Promise.all([
      prisma.category.count(),
      prisma.category.findMany({
        skip,
        take: pageSize,
        orderBy: {
          name: 'asc'
        }
      })
    ])

    return {
      data: categories,
      pagination: {
        total,
        pageSize,
        current: page,
        totalPages: Math.ceil(total / pageSize)
      }
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Failed to fetch categories')
  }
}

export async function getCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id }
    })

    if (!category) {
      throw new Error('Category not found')
    }

    return category
  } catch (error) {
    console.error('Error fetching category:', error)
    throw new Error('Failed to fetch category')
  }
}

export async function createCategory(data: CategoryFormData) {
  const validated = categorySchema.parse(data)
  return prisma.category.create({
    data: {
      id: ulid(),
      ...validated,
    },
  })
}

export async function updateCategory(data: CategoryFormData & { id: string }) {
  const { id, ...rest } = data
  const validated = categorySchema.parse(rest)
  return prisma.category.update({
    where: { id },
    data: validated,
  })
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({
    where: { id },
  })
} 