'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Space, Select, message } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import type { Topic } from '@prisma/client'
import { MDXEditor } from '@/components/mdx-editor'
import { createPost } from './actions'

interface PostForm {
  title: string
  content: string
  topicIds: string[]
  description?: string
}

export default function NewPostPage() {
  const router = useRouter()
  const { control, handleSubmit } = useForm<PostForm>()
  const [submitting, setSubmitting] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])

  // 获取所有可选的主题
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics?pageSize=100')
        const result = await response.json()
        setTopics(result.data)
      } catch (error) {
        message.error('获取主题列表失败')
        console.error(error)
      }
    }

    fetchTopics()
  }, [])

  const onSubmit = async (data: PostForm) => {
    try {
      setSubmitting(true)
      await createPost(data)
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
      <Form layout="vertical" onSubmitCapture={handleSubmit(onSubmit)} style={{ maxWidth: 800 }}>
        <Controller
          name="title"
          control={control}
          rules={{ required: '请输入标题' }}
          render={({ field, fieldState: { error } }) => (
            <Form.Item 
              label="标题" 
              validateStatus={error ? 'error' : undefined}
              help={error?.message}
            >
              <Input {...field} placeholder="请输入标题" />
            </Form.Item>
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Form.Item label="描述">
              <Input.TextArea {...field} rows={4} placeholder="请输入描述" />
            </Form.Item>
          )}
        />

        <Controller
          name="topicIds"
          control={control}
          render={({ field }) => (
            <Form.Item label="所属主题">
              <Select
                mode="multiple"
                allowClear
                placeholder="请选择主题"
                {...field}
                options={topics.map((topic: Topic) => ({
                  label: topic.title,
                  value: topic.id,
                }))}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="content"
          control={control}
          rules={{ required: '请输入内容' }}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <Form.Item 
              label="内容" 
              validateStatus={error ? 'error' : undefined}
              help={error?.message}
            >
              <MDXEditor value={value} onChange={onChange} />
            </Form.Item>
          )}
        />

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