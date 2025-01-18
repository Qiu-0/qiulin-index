'use client'

import { useEffect, useState } from "react"
import { Layout, Menu, theme } from "antd"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const { Header, Content, Sider } = Layout

const queryClient = new QueryClient()

const menuItems = [
  {
    key: "dashboard",
    label: "仪表盘",
    path: "/dashboard",
  },
  {
    key: "topics",
    label: "主题管理",
    path: "/dashboard/topics",
  },
  {
    key: "categories",
    label: "分类管理",
    path: "/dashboard/categories",
  },
  {
    key: "posts",
    label: "博客管理",
    path: "/dashboard/posts",
  },
]

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const matchedItem = menuItems.find(item => {
      // 对于仪表盘路径，只有完全匹配时才选中
      if (item.key === 'dashboard') {
        return pathname === item.path
      }
      // 对于其他路径，允许子路径匹配
      return pathname.startsWith(item.path)
    })
    if (matchedItem) {
      setSelectedKeys([matchedItem.key])
    } else {
      setSelectedKeys([])
    }
  }, [pathname])

  // 检查是否已登录
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token && pathname !== "/login") {
      router.push("/login")
    }
  }, [pathname, router])

  // 如果是登录页面，不显示管理布局
  if (pathname === "/login") {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ display: "flex", alignItems: "center", padding: "0 24px" }}>
          <div style={{ color: "#fff", fontSize: "18px", fontWeight: "bold" }}>
            博客管理系统
          </div>
          <Link 
            href="/" 
            style={{ 
              marginLeft: "auto", 
              color: "#fff",
              fontSize: "14px",
              textDecoration: "none"
            }}
          >
            返回首页
          </Link>
        </Header>
        <Layout>
          <Sider width={200}>
            <Menu
              mode="inline"
              selectedKeys={selectedKeys}
              style={{ height: "100%", borderRight: 0 }}
              items={menuItems.map(item => ({
                key: item.key,
                label: <Link href={item.path}>{item.label}</Link>,
              }))}
            />
          </Sider>
          <Layout style={{ padding: "24px" }}>
            <Content
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </QueryClientProvider>
  )
} 