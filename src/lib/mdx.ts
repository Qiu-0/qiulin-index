export interface Heading {
  id: string
  text: string
  level: number
}

export function extractHeadingsFromMarkdown(content: string): Heading[] {
  const lines = content.split('\n')
  const headings: Heading[] = []

  lines.forEach(line => {
    // 匹配标题行，确保标题前没有其他字符（避免匹配代码块中的#）
    const match = line.match(/^(#{1,6})\s+(.+?)\s*$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      
      // 使用与 MDX 组件相同的 ID 生成逻辑
      const id = `h${level}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
      
      headings.push({
        id,
        text,
        level
      })
    }
  })

  return headings
} 