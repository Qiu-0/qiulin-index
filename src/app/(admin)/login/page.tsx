'use client'

import { useRouter } from "next/navigation"
import { Card, Form, Input, Button, message } from "antd"
import { LockOutlined, UserOutlined } from "@ant-design/icons"

interface LoginForm {
  username: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [form] = Form.useForm()

  const onFinish = async (values: LoginForm) => {
    try {
      // TODO: 实现实际的登录逻辑
      if (values.username === process.env.NEXT_PUBLIC_ADMIN_USERNAME && 
          values.password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
        // 模拟登录成功
        localStorage.setItem("token", "dummy-token")
        message.success("登录成功")
        router.push("/dashboard")
      } else {
        message.error("用户名或密码错误")
      }
    } catch (error) {
      message.error("登录失败")
      console.error(error)
    }
  }

  return (
    <div style={{ 
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f0f2f5"
    }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2>博客管理系统</h2>
        </div>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
} 