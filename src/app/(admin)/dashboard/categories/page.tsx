'use client'

import { Button, Card, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateId } from '@/lib/utils/ulid'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
})

type Category = {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

type CategoryFormData = {
  name: string
  description?: string
}

export default function CategoriesPage() {
  const [form] = Form.useForm<CategoryFormData>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const queryClient = useQueryClient()

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to fetch categories')
      const json = await res.json()
      return json as {
        data: Category[]
        total: number
        page: number
        pageSize: number
      }
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData & { id: string }) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create category')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('分类创建成功')
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: () => {
      message.error('分类创建失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: CategoryFormData & { id: string }) => {
      const res = await fetch(`/api/categories/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update category')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('分类更新成功')
      setIsModalOpen(false)
      setEditingCategory(null)
      form.resetFields()
    },
    onError: () => {
      message.error('分类更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete category')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('分类删除成功')
    },
    onError: () => {
      message.error('分类删除失败')
    },
  })

  const handleCreate = useCallback(async (values: CategoryFormData) => {
    try {
      const validatedData = categorySchema.parse(values)
      if (editingCategory) {
        await updateMutation.mutateAsync({
          ...validatedData,
          id: editingCategory.id,
        })
      } else {
        await createMutation.mutateAsync({
          ...validatedData,
          id: generateId(),
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        message.error(error.errors[0].message)
      } else {
        message.error('操作失败')
      }
    }
  }, [createMutation, updateMutation, editingCategory])

  const handleEdit = useCallback((record: Category) => {
    setEditingCategory(record)
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    })
    setIsModalOpen(true)
  }, [form])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (error) {
      console.error('Failed to delete category:', error)
    }
  }, [deleteMutation])

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Card
        title="分类管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null)
              form.resetFields()
              setIsModalOpen(true)
            }}
          >
            新建分类
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={categoriesData?.data}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false)
          setEditingCategory(null)
          form.resetFields()
        }}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
          >
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
} 