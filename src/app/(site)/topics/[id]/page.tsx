import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getPost, getTopic } from "../../actions"
import { TopicTree } from "./_components/topic-tree"
import { PostContent } from "./_components/post-content"
import { TableOfContents } from "./_components/toc"

interface Props {
    params: { id: string }
    searchParams: { postId?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const data = await getTopic(params.id)
    if (!data) return {}

    return {
        title: data.topic.title,
        description: data.topic.description,
    }
}

async function PostData({ postId }: { postId: string }) {
    const data = await getPost(postId)
    if (!data?.post) return <PostContent />
    return <PostContent initialPost={data.post} />
}

export default async function TopicPage({ params, searchParams }: Props) {
    const data = await getTopic(params.id)
    if (!data) notFound()

    const { topic, postTrees } = data
    const postId = searchParams.postId || postTrees[0]?.post.id

    return (
        <div className="flex gap-6 -mx-6">
            {/* 左侧：博客列表（目录树） */}
            <div className="w-64 flex-shrink-0 px-6 border-r min-h-[calc(100vh-8rem)]">
                <TopicTree topic={topic} postTrees={postTrees} activePostId={postId} />
            </div>

            {/* 中间：博客内容 */}
            <div className="flex-1 px-6 min-w-0">
                <Suspense fallback={<div className="text-center py-12">加载中...</div>}>
                    {postId ? <PostData postId={postId} /> : <PostContent />}
                </Suspense>
            </div>

            {/* 右侧：文章目录 */}
            <div className="w-64 flex-shrink-0 px-6 border-l min-h-[calc(100vh-8rem)]">
                <div className="sticky top-20">
                    <Suspense fallback={<div className="text-center py-4">加载目录...</div>}>
                        {postId && <TableOfContents />}
                    </Suspense>
                </div>
            </div>
        </div>
    )
} 