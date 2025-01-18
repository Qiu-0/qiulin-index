'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Tabs } from 'antd'
import PostTree from './post-tree'

export default function TopicDetail() {
  const params = useParams()
  const topicId = params.id as string

  const { data: topic, isLoading } = useQuery({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      const res = await fetch(`/api/topics/${topicId}`)
      if (!res.ok) throw new Error('Failed to fetch topic')
      return res.json()
    }
  })

  if (isLoading) return <div>加载中...</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{topic.title}</h1>
      <Tabs
        items={[
          {
            key: 'tree',
            label: '文章树形结构',
            children: <PostTree topicId={topicId} />
          },
          {
            key: 'info',
            label: '主题信息',
            children: (
              <div className="mt-4">
                <p className="text-gray-600">{topic.description}</p>
              </div>
            )
          }
        ]}
      />
    </div>
  )
} 