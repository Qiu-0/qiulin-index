import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "秋林的博客",
  description: "个人博客系统",
}

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={cn("min-h-screen bg-background antialiased", inter.className)}>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">秋林的博客</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-6">
              <Link href="/topics" className="text-sm font-medium transition-colors hover:text-primary">
                主题
              </Link>
              <Link href="/posts" className="text-sm font-medium transition-colors hover:text-primary">
                博客
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a href="https://github.com/qiulin" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
              秋林
            </a>
            . The source code is available on{" "}
            <a href="https://github.com/qiulin/qiulin-index" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  )
} 