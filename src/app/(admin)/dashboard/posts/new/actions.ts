'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { ulid } from 'ulid'

interface CreatePostData {
    title: string
    content: string
    topicIds: string[]
    published?: boolean
}

export async function createPost(data: CreatePostData) {
    try {
        const postId = ulid()
        const post = await prisma.post.create({
            data: {
                id: postId,
                title: data.title,
                content: data.content,
                published: data.published ?? true,
                postTrees: {
                    create: data.topicIds.map(topicId => ({
                        id: ulid(),
                        topicId,
                    })),
                },
            },
        })

        revalidatePath('/dashboard/posts')
        return post
    } catch (error) {
        console.error('创建文章失败:', error)
        throw error
    }
} 