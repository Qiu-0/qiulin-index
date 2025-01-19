'use client'

import { useState } from 'react'
import { Button, Tree, Modal, Form, Input, message, Card, Space } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    createPost,
    updatePost,
    deletePost,
    updateTopicPostTree,
    getTopic,
    getTopicPosts,
    type PostFormData,
    type UpdateTopicPostTreeData,
    type PostWithTree
} from './actions'
import type { DataNode } from 'antd/es/tree'

interface ExtendedDataNode extends DataNode {
    order?: number
    parentId?: string | null
    children?: ExtendedDataNode[]
}

export default function TopicDetailPage({ params }: { params: { id: string } }) {
    const [form] = Form.useForm<PostFormData>()
    const [modalVisible, setModalVisible] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const { data: topic, isLoading: isLoadingTopic } = useQuery({
        queryKey: ['topic', params.id],
        queryFn: () => getTopic(params.id)
    })

    const { data: posts, isLoading: isLoadingPosts } = useQuery<PostWithTree[]>({
        queryKey: ['topic-posts', params.id],
        queryFn: () => getTopicPosts(params.id)
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

    const updateTreeMutation = useMutation<any, Error, UpdateTopicPostTreeData>({
        mutationFn: updateTopicPostTree,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topic-posts', params.id] })
            message.success('文章结构更新成功')
        }
    })

    const buildTreeData = (posts: PostWithTree[]): ExtendedDataNode[] => {
        const postMap = new Map(posts.map(post => [post.id, post]))
        const treeMap = new Map<string, ExtendedDataNode>()
        const rootNodes: ExtendedDataNode[] = []

        // 首先创建所有节点
        posts.forEach(post => {
            const postTree = post.postTrees.find(pt => pt.topicId === params.id)
            const treeNode: ExtendedDataNode = {
                key: post.id,
                title: (
                    <div className="flex items-center justify-between w-full pr-2">
                        <span>{post.title}</span>
                        <span className="text-gray-400 text-sm">
                            {postTree?.order !== undefined ? `(${postTree.order})` : ''}
                        </span>
                    </div>
                ),
                order: postTree?.order || 0,
                parentId: postTree?.parentId
            }
            treeMap.set(post.id, treeNode)
        })

        // 然后构建树形结构
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
                    // 对子节点按 order 排序
                    parentNode.children.sort((a, b) => (a.order || 0) - (b.order || 0))
                }
            } else {
                rootNodes.push(treeNode)
            }
        })

        // 对根节点按 order 排序
        return rootNodes.sort((a, b) => (a.order || 0) - (b.order || 0))
    }

    const handleSubmit = async (values: PostFormData) => {
        if (editingId) {
            updateMutation.mutate({ id: editingId, ...values })
        } else {
            createMutation.mutate({ ...values, topicId: params.id })
        }
    }

    const handleDrop = (info: any) => {
        const dropKey = info.node.key as string
        const dragKey = info.dragNode.key as string
        const dropPos = info.node.pos.split('-')
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

        // 获取所有同级节点
        const getSiblings = (parentId: string | null): ExtendedDataNode[] => {
            if (!posts) return []
            return posts
                .filter(post => {
                    const postTree = post.postTrees.find(pt => pt.topicId === params.id)
                    return postTree?.parentId === parentId
                })
                .map(post => {
                    const postTree = post.postTrees.find(pt => pt.topicId === params.id)
                    return {
                        key: post.id,
                        order: postTree?.order || 0
                    } as ExtendedDataNode
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0))
        }

        // 计算新的顺序
        const calculateNewOrder = (siblings: ExtendedDataNode[], targetPosition: number): number => {
            if (siblings.length === 0) return 0
            const firstOrder = siblings[0]?.order || 0
            const lastOrder = siblings[siblings.length - 1]?.order || 0

            if (targetPosition <= 0) return firstOrder - 1000
            if (targetPosition >= siblings.length) return lastOrder + 1000

            const prevOrder = siblings[targetPosition - 1]?.order || 0
            const nextOrder = siblings[targetPosition]?.order || 0
            return (prevOrder + nextOrder) / 2
        }

        let newParentId: string | null = null
        let newOrder = 0

        if (dropPosition === 0) {
            // 放在节点内部作为第一个子节点
            newParentId = dropKey
            const siblings = getSiblings(dropKey)
            newOrder = calculateNewOrder(siblings, 0)
        } else {
            // 放在节点前后
            const targetNode = info.node as ExtendedDataNode
            newParentId = targetNode.parentId || null
            const siblings = getSiblings(newParentId)
            const targetIndex = siblings.findIndex(node => node.key === targetNode.key)
            newOrder = calculateNewOrder(siblings, dropPosition > 0 ? targetIndex + 1 : targetIndex)
        }

        updateTreeMutation.mutate({
            topicId: params.id,
            postId: dragKey,
            parentId: newParentId,
            order: newOrder
        })
    }

    const handleEditClick = (post: PostWithTree) => {
        setEditingId(post.id)
        form.setFieldsValue({
            title: post.title,
            description: post.description || undefined,
            content: post.content
        })
        setModalVisible(true)
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
                                onClick={() => handleEditClick(selectedPost)}
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