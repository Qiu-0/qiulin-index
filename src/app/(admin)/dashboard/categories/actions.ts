'use server'

import { z } from 'zod'
import { ulid } from 'ulid'
import prisma from '@/lib/prisma'

const categorySchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

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