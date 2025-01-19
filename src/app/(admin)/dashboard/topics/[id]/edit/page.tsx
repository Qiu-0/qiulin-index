'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Space, Select, message, Spin } from 'antd'
import type { Topic, Category } from '@prisma/client'
import { getCategories } from '../../../categories/actions'
import { getTopic, updateTopic } from '../actions'

interface TopicForm {
  title: string
  description?: string
  categoryIds: string[]
}

interface TopicWithCategories extends Topic {
  categories: Category[]
}

export default function TopicEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form] = Form.useForm<TopicForm>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const isNew = params.id === 'new'

  // 获取所有可选的分类
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const result = await getCategories(100)
        setCategories(result.data)
      } catch (error) {
        message.error('获取选项数据失败')
        console.error(error)
      }
    }

    fetchOptions()
  }, [])

  // 获取主题详情
  useEffect(() => {
    const fetchTopic = async () => {
      if (isNew) return
      try {
        setLoading(true)
        const topic = await getTopic(params.id)
        form.setFieldsValue({
          title: topic.title,
          description: topic.description || undefined,
          categoryIds: topic.categories.map(c => c.id)
        })
      } catch (error) {
        message.error('获取主题详情失败')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopic()
  }, [isNew, params.id, form])

  const onFinish = async (values: TopicForm) => {
    try {
      setSubmitting(true)
      await updateTopic({ id: params.id, ...values })
      message.success('更新成功')
      router.push('/dashboard/topics')
    } catch (error) {
      message.error('更新失败')
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
    <Card title="编辑主题">
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
          rules={[{ required: true, message: '请选择至少一个分类' }]}
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
              更新
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