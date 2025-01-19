import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { getTopic } from "../../actions"

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getTopic(params.id)
  if (!data) return {}

  return {
    title: data.topic.title,
    description: data.topic.description,
  }
}

function PostTree({ tree, level = 0 }: { tree: any; level?: number }) {
  return (
    <div className={level > 0 ? "ml-6" : ""}>
      <Link
        href={`/posts/${tree.post.id}`}
        className="group flex items-center py-2 hover:text-primary"
      >
        <ChevronRight className="mr-2 h-4 w-4 flex-shrink-0" />
        <span className="group-hover:underline">{tree.post.title}</span>
      </Link>
      {tree.children?.length > 0 && (
        <div className="space-y-1">
          {tree.children.map((child: any) => (
            <PostTree key={child.id} tree={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function TopicPage({ params }: Props) {
  const data = await getTopic(params.id)
  if (!data) notFound()

  const { topic, postTrees } = data

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {topic.categories.map((category: any) => (
            <span
              key={category.id}
              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {category.name}
            </span>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
        {topic.description && (
          <p className="text-muted-foreground">{topic.description}</p>
        )}
      </div>

      <div className="space-y-1">
        {postTrees.map((tree: any) => (
          <PostTree key={tree.id} tree={tree} />
        ))}
      </div>
    </div>
  )
} 