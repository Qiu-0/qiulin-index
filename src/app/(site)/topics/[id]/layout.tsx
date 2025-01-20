import { notFound } from "next/navigation"
import { getTopic } from "../../actions"
import { TopicTree } from "./_components/topic-tree"
import { headers } from "next/headers"

interface Props {
    children: React.ReactNode
    params: { 
        id: string
    }
}

export default async function TopicLayout({ children, params }: Props) {
    const data = await getTopic(params.id)
    if (!data) notFound()

    const { topic, postTrees } = data
    const segments = new URL(headers().get("x-url") || "", "http://localhost").pathname.split("/")
    const currentPostId = segments[segments.length - 1]

    return (
        <div className="flex gap-6 -mx-6">
            {/* 左侧：博客列表（目录树） */}
            <div className="w-64 flex-shrink-0 px-6 border-r min-h-[calc(100vh-8rem)]">
                <TopicTree topic={topic} postTrees={postTrees} currentPostId={currentPostId} />
            </div>

            {/* 主内容区域 */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    )
} 