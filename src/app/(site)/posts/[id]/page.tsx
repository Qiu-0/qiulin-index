import { extractHeadingsFromMarkdown, renderMarkdown } from "@/lib/markdown"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPost, getPublishedPosts } from "../../actions"
import { TableOfContents } from "../../topics/[id]/[postId]/toc"
import { PostTopics } from "./_components/post-topics"

interface Props {
    params: {
        id: string
    }
}

// 设置页面重新生成的时间间隔（秒）
export const revalidate = 3600 // 1小时

// 生成静态页面参数
export async function generateStaticParams() {
    // 开发环境下不进行预生成
    if (process.env.NODE_ENV === 'development') {
        return []
    }

    console.log('开始生成博客详情页面...')
    const posts = await getPublishedPosts()
    const paths = posts.map(post => ({
        id: post.id
    }))

    console.log(`总共生成 ${paths.length} 个博客详情页面`)
    return paths
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const postData = await getPost(params.id)
    if (!postData?.post) return {}

    return {
        title: postData.post.title,
        description: postData.post.description,
    }
}

export default async function PostPage({ params }: Props) {
    const { id } = params
    const postData = await getPost(id)
    if (!postData?.post) notFound()

    const { post } = postData

    // 在服务端渲染Markdown
    const [headings, html] = await Promise.all([
        Promise.resolve(extractHeadingsFromMarkdown(post.content)),
        renderMarkdown(post.content)
    ])

    return (
        <div className="flex gap-6">
            {/* 左侧：所属主题列表 */}
            <div className="w-64 flex-shrink-0 px-6 border-r min-h-[calc(100vh-8rem)]">
                <div className="sticky top-20">
                    <PostTopics postId={post.id} />
                </div>
            </div>

            {/* 中间：博客内容 */}
            <div className="flex-1 px-6 min-w-0">
                <article className="prose dark:prose-invert max-w-none">
                    <div className="not-prose mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
                        {post.description && (
                            <p className="mt-4 text-xl text-muted-foreground">{post.description}</p>
                        )}
                    </div>
                    <div className="border-b my-8" />
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                </article>
            </div>

            {/* 右侧：文章目录 */}
            <div className="w-64 flex-shrink-0 px-6 border-l min-h-[calc(100vh-8rem)]">
                <div className="sticky top-20">
                    <TableOfContents headings={headings} />
                </div>
            </div>
        </div>
    )
} 