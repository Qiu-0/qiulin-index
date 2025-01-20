import { extractHeadingsFromMarkdown, renderMarkdown } from "@/lib/markdown"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPost, getPublishedPosts, getTopic } from "../../../actions"
import { TableOfContents } from "./toc"

interface Props {
    params: {
        id: string
        postId: string
    }
}

// 设置页面重新生成的时间间隔（秒）
export const revalidate = 3600 // 1小时

// 生成静态页面参数
export async function generateStaticParams() {
    // 开发环境下不进行预生成
    // if (process.env.NODE_ENV === 'development') {
    //     return []
    // }

    console.log('开始生成主题文章页面...')
    const posts = await getPublishedPosts()
    const paths = []

    for (const post of posts) {
        // 一篇文章可能属于多个主题，为每个主题都生成一个页面
        for (const tree of post.postTrees) {
            paths.push({
                id: tree.topicId,
                postId: post.id
            })
            console.log(`- 生成文章页面: ${tree.topicId}/${post.id}`)
        }
    }

    console.log(`总共生成 ${paths.length} 个文章页面`)
    return paths
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const [topicData, postData] = await Promise.all([
        getTopic(params.id),
        getPost(params.postId)
    ])

    if (!topicData || !postData?.post) return {}

    return {
        title: `${postData.post.title} - ${topicData.topic.title}`,
        description: postData.post.description || topicData.topic.description,
    }
}

export default async function TopicPostPage({ params }: Props) {
    const { postId } = params
    const postData = await getPost(postId)
    if (!postData?.post) notFound()

    const { post } = postData

    // 在服务端渲染Markdown
    const [headings, html] = await Promise.all([
        Promise.resolve(extractHeadingsFromMarkdown(post.content)),
        renderMarkdown(post.content)
    ])


    return (
        <div className="flex gap-6">
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