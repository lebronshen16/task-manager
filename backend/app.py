from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    status = db.Column(db.String(20), default='todo')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

with app.app_context():
    db.create_all()

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    query = Task.query
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    if search:
        query = query.filter(Task.title.contains(search))
    if status:
        query = query.filter(Task.status == status)
    tasks = query.order_by(Task.created_at.desc()).all()
    return jsonify({
        'code': 200,
        'data': [task.to_dict() for task in tasks],
        'total': len(tasks)
    })

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'code': 404, 'message': '任务不存在'}), 404
    return jsonify({'code': 200, 'data': task.to_dict()})

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'code': 400, 'message': '标题不能为空'}), 400
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        status=data.get('status', 'todo')
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({'code': 201, 'data': task.to_dict(), 'message': '创建成功'}), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'code': 404, 'message': '任务不存在'}), 404
    data = request.get_json()
    if data.get('title'):
        task.title = data['title']
    if data.get('description') is not None:
        task.description = data['description']
    if data.get('status'):
        task.status = data['status']
    db.session.commit()
    return jsonify({'code': 200, 'data': task.to_dict(), 'message': '更新成功'})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'code': 404, 'message': '任务不存在'}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({'code': 200, 'message': '删除成功'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)