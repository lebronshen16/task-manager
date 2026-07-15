"use client";

import { useEffect, useState } from "react";
import {
  Layout, Menu, Typography, Table, Tag, Button, Space, Modal, Form,
  Input, Select, message, Popconfirm,
} from "antd";
import {
  HomeOutlined, AppstoreOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axios from "axios";

const { Header, Content } = Layout;
const { Title } = Typography;
const API_BASE = "http://127.0.0.1:5000/api";

const statusMap: Record<string, { color: string; text: string }> = {
  todo: { color: "default", text: "待办" },
  doing: { color: "processing", text: "进行中" },
  done: { color: "success", text: "已完成" },
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [form] = Form.useForm();

  const fetchTasks = () => {
    setLoading(true);
    axios
      .get(`${API_BASE}/tasks`)
      .then((res) => setTasks(res.data.data || []))
      .catch(() => message.error("加载失败，请确认后端已启动"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTask) {
        await axios.put(`${API_BASE}/tasks/${editingTask.id}`, values);
        message.success("更新成功");
      } else {
        await axios.post(`${API_BASE}/tasks`, values);
        message.success("创建成功");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingTask(null);
      fetchTasks();
    } catch {
      // validation failed
    }
  };

  const handleDelete = async (id: number) => {
    await axios.delete(`${API_BASE}/tasks/${id}`);
    message.success("删除成功");
    fetchTasks();
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "标题", dataIndex: "title" },
    {
      title: "状态", dataIndex: "status", width: 100,
      render: (s: string) => (
        <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>
      ),
    },
    {
      title: "创建时间", dataIndex: "created_at", width: 180,
      render: (t: string) => new Date(t).toLocaleString("zh-CN"),
    },
    {
      title: "操作", width: 220,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />}
            onClick={() => router.push(`/tasks/${record.id}`)}>详情</Button>
          <Button size="small" icon={<EditOutlined />}
            onClick={() => { setEditingTask(record); form.setFieldsValue(record); setModalOpen(true); }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center" }}>
        <Title level={3} style={{ color: "#fff", margin: 0 }}>📋 任务管理器</Title>
        <Menu theme="dark" mode="horizontal" style={{ flex: 1, marginLeft: 40 }}
          defaultSelectedKeys={["/tasks"]} onClick={({ key }) => router.push(key)}
          items={[
            { key: "/", icon: <HomeOutlined />, label: "首页" },
            { key: "/tasks", icon: <AppstoreOutlined />, label: "任务列表" },
          ]} />
      </Header>
      <Content style={{ padding: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>📝 任务列表</Title>
          <Button type="primary" icon={<PlusOutlined />}
            onClick={() => { setEditingTask(null); form.resetFields(); setModalOpen(true); }}>新建任务</Button>
        </div>
        <Table dataSource={tasks} columns={columns} rowKey="id" loading={loading} />
        <Modal title={editingTask ? "编辑任务" : "新建任务"} open={modalOpen}
          onOk={handleSubmit} onCancel={() => { setModalOpen(false); setEditingTask(null); }}>
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="标题" rules={[{ required: true, message: "请输入标题" }]}>
              <Input placeholder="请输入任务标题" />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} placeholder="请输入任务描述" />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue="todo">
              <Select>
                <Select.Option value="todo">待办</Select.Option>
                <Select.Option value="doing">进行中</Select.Option>
                <Select.Option value="done">已完成</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}