'use client'

import { useState, useEffect } from 'react'
import { Button, Table, Space, Modal, message, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import type { Post, Topic, Category } from '@prisma/client'
import { useRouter } from 'next/navigation'

interface PostWithRelations extends Post {
  postTrees: {
    topic?: Topic & { categories: Category[] }
  }[]
}

interface PostListResponse {
  data: PostWithRelations[]
  total: number
  page: number
  pageSize: number
}

export default function PostsPage() {
  const router = useRouter()
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<PostWithRelations[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const fetchData = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/posts?page=${page}&pageSize=${pageSize}`
      )
      const result: PostListResponse = await response.json()
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
      content: '确定要删除这篇文章吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/posts/${id}`, {
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
      message.warning('请选择要删除的文章')
      return
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 篇文章吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch('/api/posts/batch', {
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

  const handlePublish = async (id: string, published: boolean) => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published }),
      })
      if (response.ok) {
        message.success(published ? '发布成功' : '取消发布成功')
        fetchData(pagination.current, pagination.pageSize)
      } else {
        throw new Error(published ? '发布失败' : '取消发布失败')
      }
    } catch (error) {
      message.error(published ? '发布失败' : '取消发布失败')
      console.error(error)
    }
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
    },
    {
      title: '主题',
      key: 'topics',
      width: '25%',
      render: (_: any, record: PostWithRelations) => (
        <Space size={[0, 8]} wrap>
          {record.postTrees
            .filter(({ topic }) => topic)
            .map(({ topic }) => (
              <Tag key={topic!.id}>
                {topic!.title}
                {topic!.categories.length > 0 && (
                  <span style={{ marginLeft: 4, opacity: 0.6 }}>
                    ({topic!.categories.map(c => c.name).join(', ')})
                  </span>
                )}
              </Tag>
            ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'published',
      key: 'published',
      width: '15%',
      render: (published: boolean) => (
        <Tag color={published ? 'green' : 'orange'}>
          {published ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_: any, record: PostWithRelations) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/posts/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/dashboard/posts/${record.id}/edit`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
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
            onClick={() => router.push('/dashboard/posts/new')}
          >
            新建文章
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