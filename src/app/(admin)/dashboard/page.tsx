'use client'

import { Card, Col, Row, Statistic } from "antd"
import { FileTextOutlined, FolderOutlined } from "@ant-design/icons"
import { useEffect, useState } from "react"
import { getDashboardStats } from "./actions"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    postCount: 0,
    topicCount: 0,
  })

  useEffect(() => {
    getDashboardStats().then(setStats)
  }, [])

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="博客总数"
              value={stats.postCount}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="主题总数"
              value={stats.topicCount}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
} 