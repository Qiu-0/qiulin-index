'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Table, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createTopic, updateTopic, deleteTopic, getTopics, type TopicFormData, type TopicWithCategories } from './actions'
import { getCategories } from '../categories/actions'
import type { Category } from '@prisma/client'

export default function TopicsPage() {
  const [form] = Form.useForm<TopicFormData>()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: topics, isLoading: isLoadingTopics } = useQuery<TopicWithCategories[]>({
    queryKey: ['topics'],
    queryFn: async () => {
      console.log('Calling getTopics...')
      const result = await getTopics()
      console.log('getTopics result:', result)
      return result
    }
  })

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(100)
  })

  const createMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      message.success('主题创建成功')
      setModalVisible(false)
      form.resetFields()
    },
    onError: (error) => {
      message.error('创建主题失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      message.success('主题更新成功')
      setModalVisible(false)
      form.resetFields()
      setEditingId(null)
    },
    onError: (error) => {
      message.error('更新主题失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      message.success('主题删除成功')
    },
    onError: (error) => {
      message.error('删除主题失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  })

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: TopicWithCategories) => (
        <Link href={`/dashboard/topics/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '分类',
      key: 'categories',
      render: (_: unknown, record: TopicWithCategories) => (
        <span>
          {record.categories?.map(cat => cat.name).join(', ') || '无分类'}
        </span>
      ),
    },
    {
      title: '文章数',
      key: 'postCount',
      render: (_: unknown, record: TopicWithCategories) => (
        <span>{record._count.postTrees}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TopicWithCategories) => (
        <span>
          <Button 
            type="link" 
            onClick={() => {
              setEditingId(record.id)
              form.setFieldsValue({
                title: record.title,
                description: record.description || undefined,
                categoryIds: record.categories?.map(c => c.id) || []
              })
              setModalVisible(true)
            }}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个主题吗？',
                onOk: () => deleteMutation.mutate(record.id)
              })
            }}
          >
            删除
          </Button>
        </span>
      ),
    },
  ]

  const handleSubmit = async (values: TopicFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...values })
    } else {
      createMutation.mutate(values)
    }
  }

  const categoryOptions = categoriesData?.data.map(cat => ({
    label: cat.name,
    value: cat.id
  })) || []

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null)
            form.resetFields()
            setModalVisible(true)
          }}
        >
          新增主题
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={topics || []}
        loading={isLoadingTopics}
        rowKey="id"
      />

      <Modal
        title={editingId ? '编辑主题' : '新增主题'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingId(null)
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入主题标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="categoryIds"
            label="分类"
            rules={[{ required: true, message: '请选择至少一个分类' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择分类"
              loading={isLoadingCategories}
              options={categoryOptions}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
} 