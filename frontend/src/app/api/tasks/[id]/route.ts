import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

const DATA_FILE = '/tmp/tasks.json';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

function loadTasks(): Task[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {}
  return [];
}

function saveTasks(tasks: Task[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks), 'utf-8');
}

// GET /api/tasks/[id] - 获取任务详情
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === parseInt(params.id));
  if (!task) {
    return NextResponse.json({ code: 404, message: '任务不存在' }, { status: 404 });
  }
  return NextResponse.json({ code: 200, data: task });
}

// PUT /api/tasks/[id] - 更新任务
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tasks = loadTasks();
  const task = tasks.find((t) => t.id === parseInt(params.id));
  if (!task) {
    return NextResponse.json({ code: 404, message: '任务不存在' }, { status: 404 });
  }

  const body = await request.json();
  if (body.title) task.title = body.title;
  if (body.description !== undefined) task.description = body.description;
  if (body.status) task.status = body.status;
  if (body.priority) task.priority = body.priority;
  task.updated_at = new Date().toISOString();

  saveTasks(tasks);
  return NextResponse.json({ code: 200, data: task, message: '更新成功' });
}

// DELETE /api/tasks/[id] - 删除任务
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tasks = loadTasks();
  const index = tasks.findIndex((t) => t.id === parseInt(params.id));
  if (index === -1) {
    return NextResponse.json({ code: 404, message: '任务不存在' }, { status: 404 });
  }

  tasks.splice(index, 1);
  saveTasks(tasks);
  return NextResponse.json({ code: 200, message: '删除成功' });
}