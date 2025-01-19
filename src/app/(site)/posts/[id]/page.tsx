import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { MDXRemote } from "next-mdx-remote/rsc"
import { headers } from "next/headers"
import { getPost } from "../../actions"

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPost(params.id)
  if (!data) return {}

  return {
    title: data.post.title,
    description: data.post.description,
  }
}

export default async function PostPage({ params }: Props) {
  const data = await getPost(params.id)
  if (!data) notFound()

  const { post } = data

  return (
    <div className="container max-w-4xl mx-auto">
      <article className="prose dark:prose-invert mx-auto">
        <div className="not-prose mb-8 space-y-4">
          <div className="flex flex-wrap gap-2">
            {post.postTrees[0]?.topic && (
              <Link
                href={`/topics/${post.postTrees[0].topic.id}`}
                className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20"
              >
                {post.postTrees[0].topic.title}
              </Link>
            )}
            <time
              dateTime={new Date(post.createdAt).toISOString()}
              className="text-sm text-muted-foreground"
            >
              {format(new Date(post.createdAt), "PPP", { locale: zhCN })}
            </time>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          {post.description && (
            <p className="text-xl text-muted-foreground">{post.description}</p>
          )}
        </div>
        <MDXRemote source={post.content} />
      </article>
    </div>
  )
} 