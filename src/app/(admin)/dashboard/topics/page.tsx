'use client'

import { useState, useEffect } from 'react'
import { Button, Table, Space, Modal, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { Topic, Category } from '@prisma/client'
import { useRouter } from 'next/navigation'

interface TopicWithRelations extends Topic {
  categories: Category[]
}

interface TopicListResponse {
  data: TopicWithRelations[]
  total: number
  page: number
  pageSize: number
}

export default function TopicsPage() {
  const router = useRouter()
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TopicWithRelations[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/topics?page=${page}&pageSize=${pageSize}`
      )
      const result: TopicListResponse = await response.json()
      setData(result.data)
      setPagination({
        current: result.page,
        pageSize: result.pageSize,
        total: result.total,
      })
    } catch (error) {
      message.error('获取数据失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个主题吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/topics/${id}`, {
            method: 'DELETE',
          })
          if (response.ok) {
            message.success('删除成功')
            fetchData(pagination.current, pagination.pageSize)
          } else {
            throw new Error('删除失败')
          }
        } catch (error) {
          message.error('删除失败')
          console.error(error)
        }
      },
    })
  }

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的主题')
      return
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个主题吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch('/api/topics/batch', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: selectedRowKeys }),
          })
          if (response.ok) {
            message.success('删除成功')
            setSelectedRowKeys([])
            fetchData(pagination.current, pagination.pageSize)
          } else {
            throw new Error('删除失败')
          }
        } catch (error) {
          message.error('删除失败')
          console.error(error)
        }
      },
    })
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: '35%',
    },
    {
      title: '分类',
      key: 'categories',
      width: '25%',
      render: (_: any, record: TopicWithRelations) => (
        <Space size={[0, 8]} wrap>
          {record.categories.map((category) => (
            <Tag key={category.id} color="blue">
              {category.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_: any, record: Topic) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/dashboard/topics/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/dashboard/topics/new')}
          >
            新建主题
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button danger onClick={handleBatchDelete}>
              批量删除
            </Button>
          )}
        </Space>
        <span style={{ color: '#999' }}>
          {selectedRowKeys.length > 0 ? `已选择 ${selectedRowKeys.length} 项` : ''}
        </span>
      </div>
      <Table
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={(pagination) => {
          fetchData(pagination.current, pagination.pageSize)
        }}
      />
    </div>
  )
} 