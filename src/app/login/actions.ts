'use server'

import { login as authLogin } from '@/lib/auth'

interface LoginData {
  username: string
  password: string
}

export async function login(data: LoginData) {
  const success = await authLogin(data.username, data.password)
  if (!success) {
    throw new Error('Login failed')
  }
  return { success: true }
} 