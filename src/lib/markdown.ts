import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypeMermaid from './rehype-mermaid'

export async function renderMarkdown(content: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug) // 为标题添加id
    .use(rehypeAutolinkHeadings) // 为标题添加锚点链接
    .use(rehypePrismPlus) // 代码高亮
    .use(rehypeMermaid) // 处理 Mermaid 图表
    .use(rehypeStringify)
    .process(content)

  return String(file)
}

// 提取标题的函数移到这里
export interface Heading {
  id: string
  text: string
  level: number
}

export function extractHeadingsFromMarkdown(content: string): Heading[] {
  const headings: Array<{ id: string; text: string; level: number }> = []
  const lines = content.split('\n')

  lines.forEach(line => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      headings.push({ id, text, level })
    }
  })

  return headings
} 