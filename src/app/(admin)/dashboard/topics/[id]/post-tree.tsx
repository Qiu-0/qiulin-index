'use client'

import { Tree, Button, Modal, Form, Input, message } from 'antd'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { DataNode } from 'antd/es/tree'
import { TopicPostTree } from '@prisma/client'

interface PostTreeProps {
  topicId: string
}

export default function PostTree({ topicId }: PostTreeProps) {
  const [form] = Form.useForm()
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: treeData, isLoading } = useQuery({
    queryKey: ['topic-post-tree', topicId],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${topicId}/post-tree`)
      if (!res.ok) throw new Error('Failed to fetch post tree')
      return res.json()
    }
  })

  const { mutate: updateTree } = useMutation({
    mutationFn: async (data: { id: string; parentId?: string; order: number }) => {
      const res = await fetch(`/api/topics/${topicId}/post-tree/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Failed to update post tree')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['topic-post-tree', topicId])
      message.success('更新成功')
    }
  })

  const onDrop = (info: any) => {
    const dropKey = info.node.key
    const dragKey = info.dragNode.key
    const dropPos = info.node.pos.split('-')
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1])

    // 根据拖拽位置计算新的 parentId 和 order
    let newParentId = null
    let newOrder = 0

    if (dropPosition === 0) {
      // 放在节点内部
      newParentId = dropKey
      newOrder = 0
    } else {
      // 放在节点前后
      newParentId = info.node.parentId
      newOrder = dropPosition > 0 ? info.node.order + 1 : info.node.order
    }

    updateTree({ id: dragKey, parentId: newParentId, order: newOrder })
  }

  const convertToTreeData = (items: TopicPostTree[]): DataNode[] => {
    const itemMap = new Map(items.map(item => [item.id, item]))
    const treeNodes: DataNode[] = []

    items.forEach(item => {
      const node: DataNode = {
        key: item.id,
        title: item.post.title,
        children: []
      }

      if (item.parentId) {
        const parent = itemMap.get(item.parentId)
        if (parent) {
          if (!parent.children) parent.children = []
          parent.children.push(node)
        }
      } else {
        treeNodes.push(node)
      }
    })

    return treeNodes
  }

  if (isLoading) return <div>加载中...</div>

  return (
    <div className="p-4">
      <Tree
        className="draggable-tree"
        draggable
        blockNode
        onDrop={onDrop}
        treeData={convertToTreeData(treeData)}
      />
    </div>
  )
} 