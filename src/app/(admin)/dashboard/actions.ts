'use server'

import prisma from '@/lib/prisma'

export async function getDashboardStats() {
    const [postCount, topicCount] = await Promise.all([
        prisma.post.count(),
        prisma.topic.count(),
    ])

    return {
        postCount,
        topicCount,
    }
} 