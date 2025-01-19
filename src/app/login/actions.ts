'use server'

interface LoginData {
  username: string
  password: string
}

export async function login(data: LoginData) {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error('Login failed')
  }

  return res.json()
} 