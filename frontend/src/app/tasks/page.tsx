"use client";

import { useEffect, useState } from "react";
import {
  Layout, Menu, Typography, Table, Tag, Button, Space, Modal, Form,
  Input, Select, message, Popconfirm, Empty, Row, Col,
} from "antd";
import {
  HomeOutlined, AppstoreOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, SearchOutlined, ReloadOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { getTasks, createTask, updateTask, deleteTask, Task } from "@/lib/api";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

const statusMap: Record<string, { color: string; text: string }> = {
  todo: { color: "default", text: "待办" },
  doing: { color: "processing", text: "进行中" },
  done: { color: "success", text: "已完成" },
};

const priorityMap: Record<string, { color: string; text: string }> = {
  high: { color: "red", text: "高" },
  medium: { color: "orange", text: "中" },
  low: { color: "blue", text: "低" },
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [form] = Form.useForm();

  const fetchTasks = () => {
    setLoading(true);
    const params: { search?: string; status?: string; priority?: string } = {};
    if (searchKeyword) params.search = searchKeyword;
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    getTasks(params)
      .then((res) => setTasks(res.data.data || []))
      .catch(() => message.error("加载失败，请确认后端已启动"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, [searchKeyword, statusFilter, priorityFilter]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editingTask) {
        await updateTask(editingTask.id, values);
        message.success("更新成功");
      } else {
        await createTask(values);
        message.success("创建成功");
      }
      setModalOpen(false);
      form.resetFields();
      setEditingTask(null);
      fetchTasks();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error("操作失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      message.success("删除成功");
      fetchTasks();
    } catch {
      message.error("删除失败");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { title: "标题", dataIndex: "title", ellipsis: true },
    {
      title: "状态", dataIndex: "status", width: 100,
      render: (s: string) => (
        <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag>
      ),
    },
    {
      title: "优先级", dataIndex: "priority", width: 80,
      render: (p: string) => (
        <Tag color={priorityMap[p]?.color}>{priorityMap[p]?.text}</Tag>
      ),
    },
    {
      title: "创建时间", dataIndex: "created_at", width: 180,
      render: (t: string) => new Date(t).toLocaleString("zh-CN"),
    },
    {
      title: "操作", width: 240,
      render: (_: any, record: Task) => (
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>📝 任务列表</Title>
          <Button type="primary" icon={<PlusOutlined />}
            onClick={() => { setEditingTask(null); form.resetFields(); setModalOpen(true); }}>新建任务</Button>
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Search
              placeholder="搜索任务标题..."
              allowClear
              enterButton={<><SearchOutlined /> 搜索</>}
              onSearch={(value) => setSearchKeyword(value)}
              onChange={(e) => { if (!e.target.value) setSearchKeyword(""); }}
            />
          </Col>
          <Col xs={12} sm={5}>
            <Select
              placeholder="筛选状态"
              allowClear
              style={{ width: "100%" }}
              value={statusFilter || undefined}
              onChange={(value) => setStatusFilter(value || "")}
              options={[
                { value: "todo", label: "待办" },
                { value: "doing", label: "进行中" },
                { value: "done", label: "已完成" },
              ]}
            />
          </Col>
          <Col xs={12} sm={5}>
            <Select
              placeholder="筛选优先级"
              allowClear
              style={{ width: "100%" }}
              value={priorityFilter || undefined}
              onChange={(value) => setPriorityFilter(value || "")}
              options={[
                { value: "high", label: "高" },
                { value: "medium", label: "中" },
                { value: "low", label: "低" },
              ]}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Button icon={<ReloadOutlined />} onClick={fetchTasks}>刷新</Button>
          </Col>
        </Row>

        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: <Empty description="暂无任务，点击右上角新建一个吧" /> }}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />

        <Modal
          title={editingTask ? "编辑任务" : "新建任务"}
          open={modalOpen}
          onOk={handleSubmit}
          confirmLoading={submitting}
          onCancel={() => { setModalOpen(false); setEditingTask(null); form.resetFields(); }}
          destroyOnClose
        >
          <Form form={form} layout="vertical" preserve={false}>
            <Form.Item name="title" label="标题" rules={[
              { required: true, message: "请输入标题" },
              { max: 100, message: "标题不能超过100字" },
            ]}>
              <Input placeholder="请输入任务标题" />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} placeholder="请输入任务描述（选填）" maxLength={500} showCount />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue="todo">
              <Select>
                <Select.Option value="todo">待办</Select.Option>
                <Select.Option value="doing">进行中</Select.Option>
                <Select.Option value="done">已完成</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="priority" label="优先级" initialValue="medium">
              <Select>
                <Select.Option value="high">🔴 高</Select.Option>
                <Select.Option value="medium">🟠 中</Select.Option>
                <Select.Option value="low">🔵 低</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}