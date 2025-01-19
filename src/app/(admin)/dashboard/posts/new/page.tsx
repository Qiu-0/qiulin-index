'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Space, message, Select, Switch } from 'antd'
import { MDXEditor } from '@/components/mdx-editor'
import { getTopics, upsertPost } from '../[id]/edit/actions'

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

export default function PostNewPage() {
  const router = useRouter()
  const [form] = Form.useForm<PostForm>()
  const [submitting, setSubmitting] = useState(false)
  const [topics, setTopics] = useState<TopicOption[]>([])
  const [content, setContent] = useState('')

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

  const onFinish = async (values: PostForm) => {
    try {
      setSubmitting(true)
      const data = { ...values, content }
      await upsertPost('new', data)
      message.success('创建成功')
      router.push('/dashboard/posts')
    } catch (error) {
      message.error('创建失败')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card title="新建文章">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ published: false }}
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
              创建
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