import Link from "next/link"
import { ChevronDownIcon } from "lucide-react"

interface PostTreeNode {
  id: string
  order: number
  parentId: string | null
  topic: {
    id: string
    title: string
  }
  post: {
    id: string
    title: string
    published: boolean
  }
  children?: PostTreeNode[]
}

interface Props {
  topic: {
    id: string
    title: string
    description?: string | null
    categories: {
      id: string
      name: string
    }[]
  }
  postTrees: PostTreeNode[]
  currentPostId?: string
}

function PostTree({ tree, level = 0, currentPostId }: { tree: PostTreeNode; level?: number; currentPostId?: string }) {
  if (!tree.post.published) {
    return null
  }

  const isActive = tree.post.id === currentPostId
  const publishedChildren = tree.children?.filter(child => child.post.published)
  const hasChildren = publishedChildren && publishedChildren.length > 0

  return (
    <div className={level > 0 ? "ml-4" : ""}>
      <div className="flex items-center">
        {hasChildren ? (
          <ChevronDownIcon className="h-4 w-4 flex-shrink-0 mr-2" />
        ) : (
          <div className="w-6" />
        )}
        <Link
          href={`/topics/${tree.topic.id}/${tree.post.id}`}
          className={`group flex-1 py-2 hover:text-primary ${isActive ? "text-primary font-medium" : ""}`}
        >
          <span className="group-hover:underline line-clamp-1">{tree.post.title}</span>
        </Link>
      </div>
      {hasChildren && publishedChildren && (
        <div className="space-y-1 mt-1">
          {publishedChildren.map((child) => (
            <PostTree key={child.id} tree={child} level={level + 1} currentPostId={currentPostId} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TopicTree({ topic, postTrees, currentPostId }: Props) {
  const publishedPostTrees = postTrees.filter(tree => tree.post.published)

  return (
    <div className="space-y-4 sticky top-20">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {topic.categories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
            >
              {category.name}
            </span>
          ))}
        </div>
        <h1 className="text-xl font-bold tracking-tight">{topic.title}</h1>
        {topic.description && (
          <p className="text-sm text-muted-foreground">{topic.description}</p>
        )}
      </div>

      <div className="space-y-1">
        {publishedPostTrees.map((tree) => (
          <PostTree key={tree.id} tree={tree} currentPostId={currentPostId} />
        ))}
      </div>
    </div>
  )
} 