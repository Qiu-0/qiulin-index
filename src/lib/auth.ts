import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
const key = {
  kty: 'oct',
  k: process.env.JWT_SECRET_KEY,
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secretKey)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, secretKey, {
    algorithms: ['HS256'],
  })
  return payload
}

export async function login(username: string, password: string) {
  console.log(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD, username, password)
  // 验证用户名和密码是否匹配环境变量中的配置
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    // 创建一个不包含敏感信息的 token
    const token = await encrypt({ authenticated: true })
    console.log(token)
    // 设置 cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })
    
    return true
  }
  return false
}

export async function logout() {
  cookies().delete('token')
}

export async function getAuthStatus() {
  const token = cookies().get('token')
  if (!token) return false
  
  try {
    await decrypt(token.value)
    return true
  } catch {
    return false
  }
}

export async function validateRequest(request: NextRequest) {
  const token = request.cookies.get('token')
  
  if (!token) {
    return false
  }
  
  try {
    await decrypt(token.value)
    return true
  } catch {
    return false
  }
} 