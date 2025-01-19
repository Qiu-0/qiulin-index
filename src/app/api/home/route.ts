import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
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
      // 获取热门主题（这里简单地获取前8个主题）
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

    return NextResponse.json({
      latestPosts,
      popularTopics
    })
  } catch (error) {
    console.error("Error fetching home data:", error)
    return NextResponse.json(
      { error: "Failed to fetch home data" },
      { status: 500 }
    )
  }
} 