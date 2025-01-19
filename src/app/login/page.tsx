'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Form, Input, Button, Card, message } from 'antd'
import { login } from './actions'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    const onFinish = async (values: { username: string; password: string }) => {
        try {
            await login(values)
            router.push(callbackUrl)
        } catch (error) {
            message.error('登录失败')
            console.error(error)
        }
    }

    return (
        <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            style={{ maxWidth: 300 }}
        >
            <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名!' }]}
            >
                <Input placeholder="用户名" />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
            >
                <Input.Password placeholder="密码" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                    登录
                </Button>
            </Form.Item>
        </Form>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card title="登录" style={{ width: 400 }}>
                <Suspense fallback={<div>Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </Card>
        </div>
    )
} 