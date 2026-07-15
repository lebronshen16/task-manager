"use client";

import { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Descriptions, Tag, Button, Spin, Result } from "antd";
import { HomeOutlined, AppstoreOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { getTask, Task } from "@/lib/api";

const { Header, Content } = Layout;
const { Title } = Typography;

const statusMap: Record<string, { color: string; text: string }> = {
  todo: { color: "default", text: "待办" },
  doing: { color: "processing", text: "进行中" },
  done: { color: "success", text: "已完成" },
};

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    getTask(Number(params.id))
      .then((res) => setTask(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Title level={3} style={{ color: "#fff", margin: 0 }}>📋 任务管理器</Title>
        <Menu theme="dark" mode="horizontal" style={{ flex: 1, marginLeft: 40 }}
          onClick={({ key }) => router.push(key)}
          items={[
            { key: "/", icon: <HomeOutlined />, label: "首页" },
            { key: "/tasks", icon: <AppstoreOutlined />, label: "任务列表" },
          ]} />
      </Header>
      <Content style={{ padding: 40 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/tasks")}
          style={{ marginBottom: 24 }}>返回列表</Button>
        {loading ? (
          <Spin size="large" />
        ) : error ? (
          <Result
            status="404"
            title="任务不存在"
            subTitle="请检查任务 ID 是否正确"
            extra={<Button type="primary" onClick={() => router.push("/tasks")}>返回列表</Button>}
          />
        ) : task ? (
          <Card>
            <Title level={2}>{task.title}</Title>
            <Descriptions column={1} bordered style={{ marginTop: 24 }}>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[task.status]?.color}>{statusMap[task.status]?.text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="描述">{task.description || "暂无描述"}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(task.created_at).toLocaleString("zh-CN")}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {new Date(task.updated_at).toLocaleString("zh-CN")}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        ) : null}
      </Content>
    </Layout>
  );
}