'use client'

import { useState } from 'react'
import { Button, Table, Modal, Form, Input, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory, updateCategory, deleteCategory, getCategories, type CategoryFormData } from './actions'
import { Category } from '@prisma/client'

export default function CategoriesPage() {
  const [form] = Form.useForm<CategoryFormData>()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(100)
  })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('分类创建成功')
      setModalVisible(false)
      form.resetFields()
    },
    onError: (error) => {
      message.error('创建分类失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  })

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('分类更新成功')
      setModalVisible(false)
      form.resetFields()
      setEditingId(null)
    },
    onError: (error) => {
      message.error('更新分类失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('分类删除成功')
    },
    onError: (error) => {
      message.error('删除分类失败：' + (error instanceof Error ? error.message : '未知错误'))
    }
  })

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
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Category) => (
        <span>
          <Button 
            type="link" 
            onClick={() => {
              setEditingId(record.id)
              form.setFieldsValue({
                name: record.name,
                description: record.description || undefined
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
                content: '确定要删除这个分类吗？',
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

  const handleSubmit = async (values: CategoryFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...values })
    } else {
      createMutation.mutate(values)
    }
  }

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
          新增分类
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categoriesData?.data || []}
        loading={isLoading}
        rowKey="id"
      />

      <Modal
        title={editingId ? '编辑分类' : '新增分类'}
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
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea />
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