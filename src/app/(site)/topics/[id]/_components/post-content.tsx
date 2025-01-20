'use client'

import { Suspense, useEffect, useRef } from "react"
import { MDXRemote } from "next-mdx-remote/rsc"
import mermaid from "mermaid"
import { usePostStore } from "./use-post-store"
import dynamic from 'next/dynamic'

// 动态导入 MDXRemote 组件
const MDXRemoteComponent = dynamic(() => import('next-mdx-remote/rsc').then(mod => ({ default: mod.MDXRemote })), {
  ssr: false,
  loading: () => <div>加载中...</div>
})

// Mermaid 组件
function Mermaid({ children }: { children: string }) {
  useEffect(() => {
    mermaid.contentLoaded()
  }, [children])

  return (
    <div className="mermaid">
      {children}
    </div>
  )
}

// 初始化 mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
})

// MDX 组件映射
const mdxComponents = {
  Mermaid,
  h1: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : String(children)
    const id = `h1-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    return <h1 id={id} {...props}>{children}</h1>
  },
  h2: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : String(children)
    const id = `h2-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    return <h2 id={id} {...props}>{children}</h2>
  },
  h3: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : String(children)
    const id = `h3-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    return <h3 id={id} {...props}>{children}</h3>
  },
  h4: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : String(children)
    const id = `h4-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    return <h4 id={id} {...props}>{children}</h4>
  },
  h5: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : String(children)
    const id = `h5-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    return <h5 id={id} {...props}>{children}</h5>
  },
  h6: ({ children, ...props }: any) => {
    const text = typeof children === 'string' ? children : Array.isArray(children) ? children.join('') : String(children)
    const id = `h6-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    return <h6 id={id} {...props}>{children}</h6>
  },
}

interface Props {
  initialPost?: any
}

export function PostContent({ initialPost }: Props) {
  const { post, setPost } = usePostStore()

  // 当组件挂载或 initialPost 变化时，更新 store
  useEffect(() => {
    if (initialPost) {
      setPost(initialPost)
    }
  }, [initialPost, setPost])

  if (!post) {
    return (
      <div className="text-center text-muted-foreground py-12">
        请选择一篇文章阅读
      </div>
    )
  }

  return (
    <article className="prose dark:prose-invert max-w-none">
      <div className="not-prose mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
        {post.description && (
          <p className="mt-4 text-xl text-muted-foreground">{post.description}</p>
        )}
      </div>
      <MDXRemoteComponent source={post.content} components={mdxComponents} />
    </article>
  )
} 