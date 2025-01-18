'use client'

import { Card, Col, Row, Statistic } from "antd"
import { FileTextOutlined, FolderOutlined } from "@ant-design/icons"

export default function DashboardPage() {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="博客总数"
              value={0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="主题总数"
              value={0}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
} 