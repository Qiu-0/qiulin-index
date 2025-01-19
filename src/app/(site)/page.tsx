import Link from "next/link"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { getHomeData } from "./actions"

export default async function HomePage() {
  const { latestPosts, popularTopics } = await getHomeData()

  return (
    <div className="space-y-10">
      {/* 欢迎区域 */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          欢迎来到秋林的博客
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
          分享技术、生活和思考的个人博客空间
        </p>
      </section>

      {/* 最新博客 */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">最新博客</h2>
          <Link
            href="/posts"
            className="text-sm font-medium text-primary hover:underline"
          >
            查看全部
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post: any) => (
            <article
              key={post.id}
              className="group relative rounded-lg border p-6 hover:shadow transition-shadow"
            >
              <h3 className="text-lg font-semibold leading-none tracking-tight mb-2">
                <Link href={`/posts/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {post.description}
              </p>
              <time
                dateTime={post.createdAt}
                className="text-sm text-muted-foreground"
              >
                {format(new Date(post.createdAt), "PPP", { locale: zhCN })}
              </time>
              {post.postTrees[0]?.topic && (
                <div className="absolute top-4 right-4">
                  <Link
                    href={`/topics/${post.postTrees[0].topic.id}`}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full hover:bg-primary/20"
                  >
                    {post.postTrees[0].topic.title}
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* 热门主题 */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6">热门主题</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularTopics.map((topic: any) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.id}`}
              className="group relative aspect-square rounded-lg border p-6 hover:shadow transition-shadow flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2 group-hover:underline">
                  {topic.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {topic.description}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {topic._count.postTrees} 篇文章
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
} 