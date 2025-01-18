'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button, Form, Input, message, ConfigProvider } from 'antd'

const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(249, 250, 251)',
    padding: '1rem',
}

const formContainerStyle: React.CSSProperties = {
    width: 420,
    maxWidth: '90vw',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
}

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)

    const onFinish = async (values: { username: string; password: string }) => {
        try {
            setLoading(true)
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })

            if (!res.ok) {
                throw new Error('Login failed')
            }

            const from = searchParams.get('from') || '/dashboard'
            router.push(from)
            router.refresh()
        } catch (error) {
            message.error('用户名或密码错误')
        } finally {
            setLoading(false)
        }
    }

    return (
        <ConfigProvider
            theme={{
                components: {
                    Form: {
                        itemMarginBottom: 24,
                    },
                },
            }}
        >
            <div style={containerStyle}>
                <div style={formContainerStyle}>
                    <h2 style={{ margin: '0 0 2rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'rgb(17, 24, 39)' }} className=" bg-red-600">
                        管理员登录
                    </h2>
                    <Form
                        name="login"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                        size="large"
                    >
                        <Form.Item
                            label="用户名"
                            name="username"
                            rules={[{ required: true, message: '请输入用户名' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: '100%', height: 40 }}
                                loading={loading}
                            >
                                登录
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </ConfigProvider>
    )
} 