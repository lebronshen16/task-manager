from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timezone, timedelta
import json
import os

app = Flask(__name__)
CORS(app)

# 北京时间时区
TZ = timezone(timedelta(hours=8))

# 数据文件路径
DATA_FILE = '/tmp/tasks.json'


def load_tasks():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []


def save_tasks(tasks):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(tasks, f, ensure_ascii=False)


def now_str():
    return datetime.now(TZ).isoformat()


# API 1：获取任务列表
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = load_tasks()
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    priority = request.args.get('priority', '')

    if search:
        tasks = [t for t in tasks if search.lower() in t['title'].lower()]
    if status:
        tasks = [t for t in tasks if t['status'] == status]
    if priority:
        tasks = [t for t in tasks if t['priority'] == priority]

    tasks.sort(key=lambda t: t['created_at'], reverse=True)
    return jsonify({'code': 200, 'data': tasks, 'total': len(tasks)})


# API 2：获取任务详情
@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    tasks = load_tasks()
    for t in tasks:
        if t['id'] == task_id:
            return jsonify({'code': 200, 'data': t})
    return jsonify({'code': 404, 'message': '任务不存在'}), 404


# API 3：创建任务
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'code': 400, 'message': '标题不能为空'}), 400

    tasks = load_tasks()
    new_id = max([t['id'] for t in tasks], default=0) + 1
    task = {
        'id': new_id,
        'title': data['title'],
        'description': data.get('description', ''),
        'status': data.get('status', 'todo'),
        'priority': data.get('priority', 'medium'),
        'created_at': now_str(),
        'updated_at': now_str()
    }
    tasks.append(task)
    save_tasks(tasks)
    return jsonify({'code': 201, 'data': task, 'message': '创建成功'}), 201


# API 4：更新任务
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    tasks = load_tasks()
    for t in tasks:
        if t['id'] == task_id:
            data = request.get_json()
            if data.get('title'):
                t['title'] = data['title']
            if data.get('description') is not None:
                t['description'] = data['description']
            if data.get('status'):
                t['status'] = data['status']
            if data.get('priority'):
                t['priority'] = data['priority']
            t['updated_at'] = now_str()
            save_tasks(tasks)
            return jsonify({'code': 200, 'data': t, 'message': '更新成功'})
    return jsonify({'code': 404, 'message': '任务不存在'}), 404


# API 5：删除任务
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    tasks = load_tasks()
    for i, t in enumerate(tasks):
        if t['id'] == task_id:
            tasks.pop(i)
            save_tasks(tasks)
            return jsonify({'code': 200, 'message': '删除成功'})
    return jsonify({'code': 404, 'message': '任务不存在'}), 404


@app.route('/')
def home():
    return jsonify({'code': 200, 'message': 'Task Manager API is running'})