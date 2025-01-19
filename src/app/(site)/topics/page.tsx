import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"

export const metadata: Metadata = {
  title: "主题列表",
  description: "浏览所有主题分类",
}

async function getTopics() {
  const headersList = headers()
  const host = headersList.get("host")
  const protocol = process?.env?.NODE_ENV === "development" ? "http" : "https"
  
  const res = await fetch(`${protocol}://${host}/api/topics`, {
    next: { revalidate: 3600 }
  })
  if (!res.ok) throw new Error("Failed to fetch topics")
  return res.json()
}

export default async function TopicsPage() {
  const { topics } = await getTopics()

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">主题列表</h1>
        <p className="text-muted-foreground">
          浏览所有主题分类，点击主题查看详细内容
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic: any) => (
          <Link
            key={topic.id}
            href={`/topics/${topic.id}`}
            className="group relative rounded-lg border p-6 hover:shadow transition-shadow"
          >
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2 group-hover:underline">
                  {topic.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {topic.description}
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {topic.categories.map((category: any) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {topic._count.postTrees} 篇文章
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 