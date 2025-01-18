'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Space, message, Spin, Select } from 'antd'
import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import 'bytemd/dist/index.css'
import type { Post, Topic, Category } from '@prisma/client'
import { generateId } from '@/lib/utils/ulid'

interface PostForm {
  title: string
  content: string
  description?: string
  published?: boolean
  topicIds?: string[]
}

interface PostWithRelations extends Post {
  postTrees: {
    topic: Topic & { categories: Category[] }
  }[]
}

const plugins = [
  gfm(),
]

export default function PostEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form] = Form.useForm<PostForm>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [content, setContent] = useState('')
  const isNew = params.id === 'new'

  // 获取所有可选的主题
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics?pageSize=100')
        const result = await response.json()
        console.log('获取到的主题数据：', result)
        const topicsData = Array.isArray(result) ? result : (result.data || [])
        console.log('处理后的主题数据：', topicsData)
        setTopics(topicsData)
      } catch (error) {
        message.error('获取主题列表失败')
        console.error('获取主题列表错误：', error)
      }
    }

    fetchTopics()
  }, [])

  // 获取文章详情
  useEffect(() => {
    const fetchPost = async () => {
      if (isNew) return
      try {
        setLoading(true)
        const response = await fetch(`/api/posts/${params.id}`)
        if (!response.ok) {
          throw new Error('获取文章详情失败')
        }
        const post: PostWithRelations = await response.json()
        console.log('文章详情：', post)
        // 从 postTrees 中提取主题 ID
        const topicIds = post.postTrees?.map(pt => pt.topic.id) || []
        console.log('主题 IDs：', topicIds)

        form.setFieldsValue({
          title: post.title,
          description: post.description || undefined,
          published: post.published,
          topicIds,
        })
        if (post.content) {
          setContent(post.content)
        }
      } catch (error) {
        message.error('获取文章详情失败')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [isNew, params.id, form])

  const onFinish = async (values: PostForm) => {
    try {
      setSubmitting(true)
      const url = isNew ? '/api/posts' : `/api/posts/${params.id}`
      const method = isNew ? 'POST' : 'PUT'
      const data = isNew ? { ...values, id: generateId(), content } : { ...values, content }

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
      router.push('/dashboard/posts')
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
    <Card title={isNew ? '新建文章' : '编辑文章'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
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
          <Input.TextArea rows={2} placeholder="请输入描述" />
        </Form.Item>

        <Form.Item
          name="topicIds"
          label="所属主题"
          rules={[{ required: true, message: '请选择至少一个主题' }]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="请选择主题"
            options={topics?.map(topic => ({
              label: topic.title,
              value: topic.id,
            })) || []}
          />
        </Form.Item>

        <Form.Item
          label="内容"
          required
          help="支持 Markdown 格式"
          rules={[{ required: true, message: '请输入内容' }]}
        >
          <Editor
            value={content}
            plugins={plugins}
            onChange={(v) => {
              setContent(v)
            }}
            uploadImages={async (files) => {
              // TODO: 实现图片上传功能
              return []
            }}
          />
        </Form.Item>

        <Form.Item
          name="published"
          valuePropName="checked"
        >
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {isNew ? '创建' : '更新'}
            </Button>
            <Button onClick={() => router.push('/dashboard/posts')}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
} 