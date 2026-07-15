"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Layout, Menu, Typography } from "antd";
import {
  CheckCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axios from "axios";

const { Header, Content } = Layout;
const { Title } = Typography;

const API_BASE = "http://127.0.0.1:5000/api";

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, todo: 0, doing: 0, done: 0 });

  useEffect(() => {
    axios.get(`${API_BASE}/tasks`).then((res) => {
      const tasks = res.data.data || [];
      setStats({
        total: tasks.length,
        todo: tasks.filter((t: any) => t.status === "todo").length,
        doing: tasks.filter((t: any) => t.status === "doing").length,
        done: tasks.filter((t: any) => t.status === "done").length,
      });
    }).catch(() => {
      setStats({ total: 0, todo: 0, doing: 0, done: 0 });
    });
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Title level={3} style={{ color: "#fff", margin: 0 }}>
          📋 任务管理器
        </Title>
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ flex: 1, marginLeft: 40 }}
          defaultSelectedKeys={["/"]}
          onClick={({ key }) => router.push(key)}
          items={[
            { key: "/", icon: <HomeOutlined />, label: "首页" },
            { key: "/tasks", icon: <AppstoreOutlined />, label: "任务列表" },
          ]}
        />
      </Header>
      <Content style={{ padding: 40 }}>
        <Title level={2}>📊 任务概览</Title>
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="全部任务"
                value={stats.total}
                prefix={<UnorderedListOutlined />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待办"
                value={stats.todo}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="进行中"
                value={stats.doing}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#1677ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已完成"
                value={stats.done}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}