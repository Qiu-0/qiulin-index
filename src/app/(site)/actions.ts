'use server'

import prisma from "@/lib/prisma"

export async function getHomeData() {
  try {
    const [latestPosts, popularTopics] = await Promise.all([
      // 获取最新的6篇博客
      prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          postTrees: {
            select: {
              topic: {
                select: {
                  id: true,
                  title: true,
                }
              }
            }
          }
        }
      }),
      // 获取热门主题
      prisma.topic.findMany({
        take: 8,
        select: {
          id: true,
          title: true,
          description: true,
          _count: {
            select: {
              postTrees: true
            }
          }
        },
        orderBy: {
          postTrees: {
            _count: "desc"
          }
        }
      })
    ])

    return { latestPosts, popularTopics }
  } catch (error) {
    console.error("Error fetching home data:", error)
    throw new Error("Failed to fetch home data")
  }
}

export async function getTopics() {
  try {
    const topics = await prisma.topic.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        categories: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            postTrees: true
          }
        }
      },
      orderBy: {
        postTrees: {
          _count: "desc"
        }
      }
    })

    return { topics }
  } catch (error) {
    console.error("Error fetching topics:", error)
    throw new Error("Failed to fetch topics")
  }
}

export async function getTopic(id: string) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        categories: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!topic) return null

    const postTrees = await prisma.topicPostTree.findMany({
      where: {
        topicId: id,
      },
      select: {
        id: true,
        order: true,
        parentId: true,
        postId: true,
        topic: {
          select: {
            id: true,
            title: true,
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            published: true,
          }
        }
      },
      orderBy: {
        order: "asc"
      }
    })
    
    // 组装树结构
    const buildTree = (nodes: any[], parentId: string | null = null): any[] => {
      return nodes
        .filter(node => node.parentId === parentId)
        .map(node => ({
          ...node,
          children: buildTree(nodes, node.postId)
        }))
        .sort((a, b) => a.order - b.order)
    }

    const treeData = buildTree(postTrees)
    return { topic, postTrees: treeData }
  } catch (error) {
    console.error("Error fetching topic:", error)
    throw new Error("Failed to fetch topic")
  }
}

export async function getPosts(page: number = 1) {
  try {
    const take = 10
    const skip = (page - 1) * take

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          postTrees: {
            take: 1,
            select: {
              topic: {
                select: {
                  id: true,
                  title: true,
                }
              }
            }
          }
        }
      }),
      prisma.post.count({
        where: { published: true }
      })
    ])

    return { posts, total, pageSize: take }
  } catch (error) {
    console.error("Error fetching posts:", error)
    throw new Error("Failed to fetch posts")
  }
}

export async function getPost(id: string) {
  try {
    const post = await prisma.post.findFirst({
      where: { 
        id,
        published: true 
      },
      select: {
        id: true,
        title: true,
        content: true,
        description: true,
        published: true,
        createdAt: true,
        postTrees: {
          take: 1,
          select: {
            topic: {
              select: {
                id: true,
                title: true,
              }
            }
          }
        }
      }
    })

    if (!post) return null

    return { post }
  } catch (error) {
    console.error("Error fetching post:", error)
    throw new Error("Failed to fetch post")
  }
}

export async function getPublishedPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        postTrees: {
          some: {} // 确保文章属于至少一个主题
        }
      },
      select: {
        id: true,
        postTrees: {
          select: {
            topicId: true
          }
        }
      }
    })

    return posts
  } catch (error) {
    console.error("Error fetching published posts:", error)
    throw new Error("Failed to fetch published posts")
  }
} 