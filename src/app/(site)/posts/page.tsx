import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "博客列表",
  description: "浏览所有博客文章",
}

interface Props {
  searchParams: { page?: string }
}

async function getPosts(page: number = 1) {
  const headersList = headers()
  const host = headersList.get("host")
  const protocol = process?.env?.NODE_ENV === "development" ? "http" : "https"
  
  const res = await fetch(
    `${protocol}://${host}/api/posts?page=${page}`,
    { next: { revalidate: 3600 } }
  )
  if (!res.ok) throw new Error("Failed to fetch posts")
  return res.json()
}

export default async function PostsPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1
  const { posts, total, pageSize } = await getPosts(page)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">博客列表</h1>
        <p className="text-muted-foreground">
          共 {total} 篇文章，第 {page} 页，共 {totalPages} 页
        </p>
      </div>

      <div className="space-y-8">
        {posts.map((post: any) => (
          <article key={post.id} className="group relative space-y-4">
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
                dateTime={post.createdAt}
                className="text-sm text-muted-foreground"
              >
                {format(new Date(post.createdAt), "PPP", { locale: zhCN })}
              </time>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              <Link href={`/posts/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            {post.description && (
              <p className="text-muted-foreground line-clamp-3">
                {post.description}
              </p>
            )}
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex justify-center space-x-2">
          {page > 1 && (
            <Link
              href={`/posts?page=${page - 1}`}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              上一页
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/posts?page=${page + 1}`}
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              下一页
            </Link>
          )}
        </nav>
      )}
    </div>
  )
} 