'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Space, message, Spin, Select, Switch } from 'antd'
import type { Post, Topic, Category } from '@prisma/client'
import { MDXEditor } from '@/components/mdx-editor'
import { getPost, getTopics, upsertPost } from './actions'

interface PostForm {
  title: string
  content: string
  description?: string
  published?: boolean
  topicIds?: string[]
}

interface TopicOption {
  id: string
  title: string
  description?: string | null
}

interface PostWithRelations extends Post {
  postTrees: {
    topic: Topic & { categories: Category[] }
  }[]
}

export default function PostEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [form] = Form.useForm<PostForm>()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [topics, setTopics] = useState<TopicOption[]>([])
  const [content, setContent] = useState('')
  const isNew = params.id === 'new'

  // 获取所有可选的主题
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsData = await getTopics()
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
        const post = await getPost(params.id)
        if (!post) {
          throw new Error('获取文章详情失败')
        }
        
        // 从 postTrees 中提取主题 ID
        const topicIds = post.postTrees?.map(pt => pt.topic.id) || []

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
      const data = { ...values, content }
      await upsertPost(params.id, data)
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
            options={topics.map(topic => ({
              label: topic.title,
              value: topic.id,
              title: topic.description
            }))}
            optionRender={(option) => (
              <Space>
                <span>{option.data.label}</span>
                {option.data.title && (
                  <span style={{ color: '#999', fontSize: '12px' }}>
                    ({option.data.title})
                  </span>
                )}
              </Space>
            )}
          />
        </Form.Item>

        <Form.Item
          label="内容"
          required
          help="支持 Markdown 格式"
          rules={[{ required: true, message: '请输入内容' }]}
        >
          <MDXEditor
            value={content}
            onChange={(v) => setContent(v || '')}
          />
        </Form.Item>

        <Form.Item
          name="published"
          valuePropName="checked"
        >
          <Switch checkedChildren="已发布" unCheckedChildren="未发布" />
        </Form.Item>

        <Form.Item>
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