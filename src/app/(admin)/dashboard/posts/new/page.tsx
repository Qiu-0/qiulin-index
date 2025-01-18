'use client'

import { useEffect, useState } from 'react'
import { Button, Form, Input, Select, message } from 'antd'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useStore } from './store'
import { createPost } from './actions'
import type { Topic } from '@prisma/client'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
})

const formSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  topicIds: z.array(z.string()).min(1, '请选择至少一个主题'),
  published: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function NewPostPage() {
  const router = useRouter()
  const { topics, fetchTopics } = useStore()
  const [form] = Form.useForm()
  const [content, setContent] = useState('')

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      published: true,
      content: '',
    }
  })

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const onSubmit = async (values: FormValues) => {
    try {
      await createPost(values)
      message.success('创建成功')
      router.push('/dashboard/posts')
    } catch (error) {
      message.error('创建失败')
      console.error(error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">新建文章</h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        className="max-w-4xl"
      >
        <Form.Item
          label="标题"
          validateStatus={errors.title ? 'error' : ''}
          help={errors.title?.message}
        >
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入文章标题" />
            )}
          />
        </Form.Item>

        <Form.Item
          label="主题"
          validateStatus={errors.topicIds ? 'error' : ''}
          help={errors.topicIds?.message}
        >
          <Controller
            name="topicIds"
            control={control}
            render={({ field }) => (
              <Select
                mode="multiple"
                placeholder="请选择主题"
                {...field}
                options={topics.map((topic: Topic) => ({
                  label: topic.title,
                  value: topic.id,
                }))}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="内容"
          validateStatus={errors.content ? 'error' : ''}
          help={errors.content?.message}
        >
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <MDEditor
                value={field.value}
                onChange={field.onChange}
                height={500}
                preview="edit"
              />
            )}
          />
        </Form.Item>

        <Form.Item>
          <div className="flex gap-4">
            <Button type="primary" htmlType="submit">
              发布
            </Button>
            <Button
              onClick={() => {
                form.submit()
                form.setFieldValue('published', false)
              }}
            >
              保存草稿
            </Button>
            <Button onClick={() => router.back()}>取消</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
} 