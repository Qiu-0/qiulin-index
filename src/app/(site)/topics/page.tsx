import type { Metadata } from "next"
import Link from "next/link"
import { getTopicsWithCategories } from "../actions"

export const metadata: Metadata = {
  title: "主题列表",
  description: "浏览所有主题分类",
}

export default async function TopicsPage() {
  const { categories } = await getTopicsWithCategories()

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">主题列表</h1>
        <p className="text-muted-foreground">
          浏览所有主题分类，点击主题查看详细内容
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((category) => (
          <section key={category.id} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">{category.name}</h2>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.topics.map((topic: any) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="group relative rounded-lg border p-6 hover:shadow transition-shadow"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 group-hover:underline">
                        {topic.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {topic.description}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {topic.categories.map((cat: any) => (
                          <span
                            key={cat.id}
                            className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {cat.name}
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
          </section>
        ))}
      </div>
    </div>
  )
} 