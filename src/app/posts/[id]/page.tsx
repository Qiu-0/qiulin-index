'use client'

import { useEffect, useState } from 'react'
import { Viewer } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import 'bytemd/dist/index.css'
import { Card, Spin, Tag, Space, Typography } from 'antd'
import type { Post, Topic, Category } from '@prisma/client'

const { Title } = Typography

type PostWithoutAuthorId = Omit<Post, 'authorId'>

interface PostWithRelations extends PostWithoutAuthorId {
  topics: (Topic & { categories: Category[] })[]
  author: {
    id: string
    name: string | null
  }
}

const plugins = [
  gfm(),
]

export default function PostPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<PostWithRelations | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`)
        if (!response.ok) {
          throw new Error('获取文章详情失败')
        }
        const data = await response.json()
        setPost(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        文章不存在
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <article>
          <header className="mb-8">
            <Title level={1}>{post.title}</Title>
            {post.description && (
              <p className="text-gray-500 mt-2">{post.description}</p>
            )}
            <div className="flex items-center justify-between mt-4">
              <Space size={[0, 8]} wrap>
                {post.topics.map((topic) => (
                  <Tag key={topic.id}>
                    {topic.title}
                    {topic.categories.length > 0 && (
                      <span style={{ marginLeft: 4, opacity: 0.6 }}>
                        ({topic.categories.map(c => c.name).join(', ')})
                      </span>
                    )}
                  </Tag>
                ))}
              </Space>
              <Space className="text-gray-500">
                <span>作者：{post.author.name}</span>
                <span>发布于：{new Date(post.createdAt).toLocaleString()}</span>
              </Space>
            </div>
          </header>
          <Viewer
            value={post.content}
            plugins={plugins}
          />
        </article>
      </Card>
    </div>
  )
} 