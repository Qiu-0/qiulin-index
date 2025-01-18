'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Space, Select, message } from 'antd'
import type { Topic, Category } from '@prisma/client'
import { generateId } from '@/lib/utils/ulid'

interface TopicForm {
  title: string
  description?: string
  categoryIds?: string[]
}

export default function TopicNewPage() {
  const router = useRouter()
  const [form] = Form.useForm<TopicForm>()
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const categoriesResponse = await fetch('/api/categories?pageSize=100')
        const categoriesResult = await categoriesResponse.json()
        setCategories(categoriesResult.data)
      } catch (error) {
        message.error('获取选项数据失败')
        console.error(error)
      }
    }

    fetchOptions()
  }, [])

  const onFinish = async (values: TopicForm) => {
    try {
      setSubmitting(true)
      const data = {
        ...values,
        id: generateId(),
      }

      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('创建失败')
      }

      message.success('创建成功')
      router.push('/dashboard/topics')
    } catch (error) {
      message.error('创建失败')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title="新建主题">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入标题" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={4} placeholder="请输入描述" />
        </Form.Item>

        <Form.Item
          name="categoryIds"
          label="所属分类"
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="请选择分类"
            options={categories.map(category => ({
              label: category.name,
              value: category.id,
            }))}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              创建
            </Button>
            <Button onClick={() => router.push('/dashboard/topics')}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
} 