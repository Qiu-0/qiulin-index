interface Props {
  post: {
    title: string
    description?: string | null
    html: string
  }
}

export function PostContent({ post }: Props) {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <div className="not-prose mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        {post.description && (
          <p className="mt-4 text-xl text-muted-foreground">{post.description}</p>
        )}
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  )
} 