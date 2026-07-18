import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

export const runtime = 'nodejs';

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

// GET /api/tasks - 获取任务列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';

  let tasks = loadTasks();

  if (search) {
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  }
  if (status) {
    tasks = tasks.filter((t) => t.status === status);
  }
  if (priority) {
    tasks = tasks.filter((t) => t.priority === priority);
  }

  tasks.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return NextResponse.json({ code: 200, data: tasks, total: tasks.length });
}

// POST /api/tasks - 创建任务
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ code: 400, message: '标题不能为空' }, { status: 400 });
  }

  const tasks = loadTasks();
  const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const now = new Date().toISOString();

  const task: Task = {
    id: newId,
    title: body.title,
    description: body.description || '',
    status: body.status || 'todo',
    priority: body.priority || 'medium',
    created_at: now,
    updated_at: now,
  };

  tasks.push(task);
  saveTasks(tasks);

  return NextResponse.json({ code: 201, data: task, message: '创建成功' }, { status: 201 });
}