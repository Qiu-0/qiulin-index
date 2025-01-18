import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateRequest } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 排除登录相关页面
  if (pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  // 只处理管理端路由
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/api/admin')) {
    
    const isAuthenticated = await validateRequest(request)
    
    if (!isAuthenticated) {
      // 如果是API请求，返回401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
      
      // 如果是页面请求，重定向到登录页
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login/:path*',
    '/dashboard/:path*',
    '/api/admin/:path*'
  ],
} 