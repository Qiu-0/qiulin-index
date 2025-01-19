import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SiteNav } from "@/components/site-nav"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "秋林的博客",
    template: "%s | 秋林的博客"
  },
  description: "分享技术、生活和思考的个人博客",
  keywords: ["博客", "技术", "编程", "生活", "思考"],
  authors: [{ name: "秋林" }],
  creator: "秋林",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://blog.qiulin.com",
    title: "秋林的博客",
    description: "分享技术、生活和思考的个人博客",
    siteName: "秋林的博客"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
          <SiteNav />
        </div>
      </header>
      <main className="container py-6">
        {children}
      </main>
      <footer className="border-t py-6 mt-auto">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a href="https://github.com/Qiu-0" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
              秋林
            </a>
            . The source code is available on{" "}
            <a href="https://github.com/Qiu-0/qiulin-index" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
              GitHub
            </a>
            .
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              湘ICP备2022010182号-1
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
} 