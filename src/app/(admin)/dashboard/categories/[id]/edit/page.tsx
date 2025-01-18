'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Space, message, Spin } from 'antd'
import type { Category } from '@prisma/client'
import { generateId } from '@/lib/utils/ulid'

interface CategoryForm {
  name: string
  description?: string
}

export default function CategoryEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form] = Form.useForm<CategoryForm>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const isNew = params.id === 'new'

  useEffect(() => {
    const fetchCategory = async () => {
      if (isNew) return
      try {
        setLoading(true)
        const response = await fetch(`/api/categories/${params.id}`)
        if (!response.ok) {
          throw new Error('获取分类详情失败')
        }
        const category = await response.json()
        form.setFieldsValue(category)
      } catch (error) {
        message.error('获取分类详情失败')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategory()
  }, [isNew, params.id, form])

  const onFinish = async (values: CategoryForm) => {
    try {
      setSubmitting(true)
      const url = isNew ? '/api/categories' : `/api/categories/${params.id}`
      const method = isNew ? 'POST' : 'PUT'
      const data = isNew ? { ...values, id: generateId() } : values

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`${isNew ? '创建' : '更新'}失败`)
      }

      message.success(`${isNew ? '创建' : '更新'}成功`)
      router.push('/dashboard/categories')
    } catch (error) {
      message.error(`${isNew ? '创建' : '更新'}失败`)
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Card title={isNew ? '新建分类' : '编辑分类'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 600 }}
      >
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <Input.TextArea rows={4} placeholder="请输入描述" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isNew ? '创建' : '更新'}
            </Button>
            <Button onClick={() => router.push('/dashboard/categories')}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
} 