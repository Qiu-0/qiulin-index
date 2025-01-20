import { cn } from "@/lib/utils"

interface Heading {
  id: string
  text: string
  level: number
}

interface Props {
  headings: Heading[]
}

export function TableOfContents({ headings }: Props) {
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
              href={`#${heading.text}`}
              className={cn(
                "block text-sm transition-colors text-muted-foreground hover:text-foreground",
                heading.level === 1 ? "font-medium" : "font-normal"
              )}
              style={{ 
                paddingLeft: `${(heading.level - 1) * 12}px`,
                fontSize: `${Math.max(0.75, 1 - (heading.level - 1) * 0.05)}rem`
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