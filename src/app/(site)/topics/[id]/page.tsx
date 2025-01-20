import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getTopic, getTopics } from "../../actions"

interface Props {
    params: { 
        id: string
    }
}

// 设置页面重新生成的时间间隔（秒）
export const revalidate = 3600 // 1小时

// 生成静态页面参数
export async function generateStaticParams() {
    const { topics } = await getTopics()
    return topics.map(topic => ({
        id: topic.id
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await getTopic(params.id)
    if (!data) return {}

    return {
        title: data.topic.title,
        description: data.topic.description,
    }
}

export default async function TopicPage({ params }: Props) {
    const data = await getTopic(params.id)
    if (!data) notFound()

    const { postTrees } = data
    const firstPost = postTrees[0]?.post

    if (firstPost) {
        redirect(`/topics/${params.id}/${firstPost.id}`)
    }

    return null
} 