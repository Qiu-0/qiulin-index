import { prisma } from '@/lib/prisma'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

async function getLatestPosts() {
  const posts = await prisma.post.findMany({
    where: {
      published: true
    },
    take: 6,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      topics: {
        include: {
          categories: true
        }
      }
    }
  })
  return posts
}

async function getTopics() {
  const topics = await prisma.topic.findMany({
    include: {
      categories: true,
      _count: {
        select: {
          posts: true
        }
      }
    },
    take: 10,
    orderBy: {
      createdAt: 'desc'
    }
  })
  return topics
}

export default async function HomePage() {
  const [posts, topics] = await Promise.all([getLatestPosts(), getTopics()])

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            秋林的博客
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            记录技术、生活和思考
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/posts">
                浏览博客
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/topics">
                查看主题
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="container">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">最新文章</h2>
          <Button asChild variant="ghost">
            <Link href="/posts">查看全部</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Card key={post.id} className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                <Link href={`/posts/${post.id}`} className="hover:underline">
                  {post.title}
                </Link>
              </h3>
              {post.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {post.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {post.topics.map(topic => (
                  <Link 
                    key={topic.id} 
                    href={`/topics/${topic.id}`}
                    className="text-xs bg-secondary px-2 py-1 rounded-md hover:bg-secondary/80"
                  >
                    {topic.title}
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Topics Section */}
      <section className="container pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">热门主题</h2>
          <Button asChild variant="ghost">
            <Link href="/topics">查看全部</Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(topic => (
            <Card key={topic.id} className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                <Link href={`/topics/${topic.id}`} className="hover:underline">
                  {topic.title}
                </Link>
              </h3>
              {topic.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {topic.description}
                </p>
              )}
              <div className="flex justify-between items-center">
                <div className="flex flex-wrap gap-2">
                  {topic.categories.map(category => (
                    <span 
                      key={category.id}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {topic._count.posts} 篇文章
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
} 