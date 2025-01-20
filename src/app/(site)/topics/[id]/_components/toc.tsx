'use client'

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { usePostStore } from "./use-post-store"

interface Heading {
  id: string
  text: string
  level: number
}

function extractHeadingsFromMarkdown(content: string): Heading[] {
  const lines = content.split('\n')
  const headings: Heading[] = []
  console.log('Processing content lines:', lines.length)

  lines.forEach((line, index) => {
    // 匹配标题行，确保标题前没有其他字符（避免匹配代码块中的#）
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      console.log('Found heading at line', index + 1, ':', { level, text })
      
      // 使用与 MDX 组件相同的 ID 生成逻辑
      const id = `h${level}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      console.log('Generated ID:', id)
      
      headings.push({
        id,
        text,
        level
      })
    }
  })

  console.log('Extracted all headings:', headings)
  return headings
}

export function TableOfContents() {
  const { post } = usePostStore()
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    setHeadings([])
    setActiveId("")

    if (!post?.content) return

    const extractedHeadings = extractHeadingsFromMarkdown(post.content)
    setHeadings(extractedHeadings)
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-20% 0% -60% 0%" }
    )

    // 确保DOM已经更新
    const timer = setTimeout(() => {
      extractedHeadings.forEach(heading => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.observe(element)
        }
      })
    }, 100)

    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [post?.content])

  if (headings.length === 0) return null

  return (
    <nav className="space-y-1">
      <div className="sticky top-4 rounded-lg border border-muted bg-card p-4">
        <h3 className="text-sm font-semibold mb-3 text-foreground">
          目录
        </h3>
        <div className="space-y-1">
          {headings.map((heading) => (
            <a
              key={`${heading.level}-${heading.id}`}
              href={`#${heading.id}`}
              className={cn(
                "block text-sm transition-colors",
                activeId === heading.id 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground",
                heading.level === 1 ? "font-medium" : "font-normal"
              )}
              style={{ 
                paddingLeft: `${(heading.level - 1) * 12}px`,
                fontSize: `${Math.max(0.75, 1 - (heading.level - 1) * 0.05)}rem`
              }}
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById(heading.id)
                console.log('Clicking heading:', { id: heading.id, text: heading.text, level: heading.level })
                console.log('Found element:', element)

                if (element) {
                  // 获取头部高度
                  const header = document.querySelector('header')
                  const headerHeight = header?.offsetHeight || 0
                  const padding = 24

                  // 获取元素的位置
                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                  const offsetPosition = elementPosition - headerHeight - padding

                  // 使用平滑滚动
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                  })

                  // 设置活动标题
                  setActiveId(heading.id)
                } else {
                  console.warn('Target heading element not found:', heading.id)
                }
              }}
            >
              {heading.text}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
} 