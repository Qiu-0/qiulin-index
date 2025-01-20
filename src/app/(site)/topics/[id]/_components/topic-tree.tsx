'use client'

import { useState } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

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
  activePostId?: string
}

function PostTree({ tree, level = 0, activePostId }: { tree: PostTreeNode; level?: number; activePostId?: string }) {
  if (!tree.post.published) {
    return null
  }

  const [isExpanded, setIsExpanded] = useState(true)
  const isActive = tree.post.id === activePostId
  const publishedChildren = tree.children?.filter(child => child.post.published)
  const hasChildren = publishedChildren && publishedChildren.length > 0

  return (
    <div className={level > 0 ? "ml-4" : ""}>
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mr-2 p-0.5 rounded-sm hover:bg-accent ${hasChildren ? "visible" : "invisible"}`}
        >
          <ChevronRight 
            className={`h-4 w-4 flex-shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} 
          />
        </button>
        <Link
          href={`/topics/${tree.topic.id}?postId=${tree.post.id}`}
          className={`group flex-1 py-2 hover:text-primary ${isActive ? "text-primary font-medium" : ""}`}
        >
          <span className="group-hover:underline line-clamp-1">{tree.post.title}</span>
        </Link>
      </div>
      {hasChildren && isExpanded && publishedChildren && (
        <div className="space-y-1 mt-1">
          {publishedChildren.map((child) => (
            <PostTree key={child.id} tree={child} level={level + 1} activePostId={activePostId} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TopicTree({ topic, postTrees, activePostId }: Props) {
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
          <PostTree key={tree.id} tree={tree} activePostId={activePostId} />
        ))}
      </div>
    </div>
  )
} 