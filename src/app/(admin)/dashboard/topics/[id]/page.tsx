'use client'

import { useState } from 'react'
import { Button, Tree, Modal, Form, Input, message, Card, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createPost, updatePost, deletePost, updateTopicPostTree, type PostFormData } from './actions'
import { Post, TopicPostTree } from '@prisma/client'
import { DataNode } from 'antd/es/tree'

type PostWithTree = Post & {
  postTrees: TopicPostTree[]
}

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const [form] = Form.useForm<PostFormData>()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: topic, isLoading: isLoadingTopic } = useQuery({
    queryKey: ['topic', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${params.id}`)
      return res.json()
    }
  })

  const { data: posts, isLoading: isLoadingPosts } = useQuery<PostWithTree[]>({
    queryKey: ['topic-posts', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${params.id}/posts`)
      return res.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-posts', params.id] })
      message.success('文章创建成功')
      setModalVisible(false)
      form.resetFields()
    }
  })

  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-posts', params.id] })
      message.success('文章更新成功')
      setModalVisible(false)
      form.resetFields()
      setEditingId(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-posts', params.id] })
      message.success('文章删除成功')
    }
  })

  const updateTreeMutation = useMutation({
    mutationFn: updateTopicPostTree,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topic-posts', params.id] })
      message.success('文章结构更新成功')
    }
  })

  const buildTreeData = (posts: PostWithTree[]): DataNode[] => {
    const postMap = new Map(posts.map(post => [post.id, post]))
    const treeMap = new Map<string, DataNode>()
    const rootNodes: DataNode[] = []

    posts.forEach(post => {
      const treeNode: DataNode = {
        key: post.id,
        title: post.title,
      }
      treeMap.set(post.id, treeNode)
    })

    posts.forEach(post => {
      const postTree = post.postTrees.find(pt => pt.topicId === params.id)
      if (!postTree) return

      const treeNode = treeMap.get(post.id)
      if (!treeNode) return

      if (postTree.parentId) {
        const parentNode = treeMap.get(postTree.parentId)
        if (parentNode) {
          parentNode.children = parentNode.children || []
          parentNode.children.push(treeNode)
        }
      } else {
        rootNodes.push(treeNode)
      }
    })

    return rootNodes
  }

  const handleSubmit = async (values: PostFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...values })
    } else {
      createMutation.mutate({ ...values, topicId: params.id })
    }
  }

  const handleDrop = (info: any) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    const data = {
      topicId: params.id,
      postId: dragKey,
      parentId: dropPosition === 0 ? dropKey : info.node.parent?.key || null
    }

    updateTreeMutation.mutate(data)
  }

  const selectedPost = selectedPostId ? posts?.find(p => p.id === selectedPostId) : null

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Card title="文章结构" style={{ width: 300 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null)
              form.resetFields()
              setModalVisible(true)
            }}
          >
            新增文章
          </Button>
          {!isLoadingPosts && posts && (
            <Tree
              className="draggable-tree"
              draggable
              blockNode
              onDrop={handleDrop}
              treeData={buildTreeData(posts)}
              onSelect={keys => setSelectedPostId(keys[0]?.toString() || null)}
            />
          )}
        </Space>
      </Card>

      {selectedPost && (
        <Card 
          title={selectedPost.title}
          style={{ flex: 1 }}
          extra={
            <Space>
              <Button
                onClick={() => {
                  setEditingId(selectedPost.id)
                  form.setFieldsValue(selectedPost)
                  setModalVisible(true)
                }}
              >
                编辑
              </Button>
              <Button
                danger
                onClick={() => {
                  Modal.confirm({
                    title: '确认删除',
                    content: '确定要删除这篇文章吗？',
                    onOk: () => {
                      deleteMutation.mutate(selectedPost.id)
                      setSelectedPostId(null)
                    }
                  })
                }}
              >
                删除
              </Button>
            </Space>
          }
        >
          <div>
            {selectedPost.content || '暂无内容'}
          </div>
        </Card>
      )}

      <Modal
        title={editingId ? '编辑文章' : '新增文章'}
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
            rules={[{ required: true, message: '请输入文章标题' }]}
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
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入文章内容' }]}
          >
            <Input.TextArea rows={6} />
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