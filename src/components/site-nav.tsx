"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function SiteNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        {/* 桌面端导航 */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/topics" className="text-sm font-medium transition-colors hover:text-primary">
            主题
          </Link>
          <Link href="/posts" className="text-sm font-medium transition-colors hover:text-primary">
            博客
          </Link>
        </nav>
        {/* 移动端菜单按钮 */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      {/* 移动端导航菜单 */}
      {isMenuOpen && (
        <nav className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <Link
              href="/topics"
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              主题
            </Link>
            <Link
              href="/posts"
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              博客
            </Link>
          </div>
        </nav>
      )}
    </>
  )
} 