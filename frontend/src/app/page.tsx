"use client";

import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Layout, Menu, Typography, Spin, List, Tag, Button } from "antd";
import {
  CheckCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getTasks, Task } from "@/lib/api";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const statusMap: Record<string, { color: string; text: string }> = {
  todo: { color: "default", text: "待办" },
  doing: { color: "processing", text: "进行中" },
  done: { color: "success", text: "已完成" },
};

export default function HomePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, todo: 0, doing: 0, done: 0 });

  useEffect(() => {
    setLoading(true);
    getTasks().then((res) => {
      const data = res.data.data || [];
      setTasks(data);
      setStats({
        total: data.length,
        todo: data.filter((t: Task) => t.status === "todo").length,
        doing: data.filter((t: Task) => t.status === "doing").length,
        done: data.filter((t: Task) => t.status === "done").length,
      });
    }).catch(() => {
      setStats({ total: 0, todo: 0, doing: 0, done: 0 });
    }).finally(() => setLoading(false));
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
        <Spin spinning={loading}>
          <Row gutter={24} style={{ marginTop: 24 }}>
            <Col xs={12} sm={6}>
              <Card hoverable onClick={() => router.push("/tasks")}>
                <Statistic
                  title="全部任务"
                  value={stats.total}
                  prefix={<UnorderedListOutlined />}
                  valueStyle={{ color: "#1677ff" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="待办"
                  value={stats.todo}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="进行中"
                  value={stats.doing}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: "#1677ff" }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
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
        </Spin>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48, marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>📌 最近任务</Title>
          <Button type="link" icon={<ArrowRightOutlined />} onClick={() => router.push("/tasks")}>
            查看全部
          </Button>
        </div>
        <List
          dataSource={tasks.slice(0, 5)}
          loading={loading}
          locale={{ emptyText: "暂无任务，去任务列表创建一个吧" }}
          renderItem={(item: Task) => (
            <List.Item
              extra={<Tag color={statusMap[item.status]?.color}>{statusMap[item.status]?.text}</Tag>}
              style={{ cursor: "pointer" }}
              onClick={() => router.push(`/tasks/${item.id}`)}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description || "暂无描述"}
              />
            </List.Item>
          )}
        />
      </Content>
    </Layout>
  );
}