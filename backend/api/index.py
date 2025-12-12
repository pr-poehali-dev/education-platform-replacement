import json
import os
import psycopg2
from typing import Dict, Any, List, Optional
from datetime import datetime, date

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Основное API для работы с базой данных образовательной платформы
    Args: event с httpMethod, path, queryStringParameters, body
    Returns: JSON ответ с данными
    '''
    method: str = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    path = params.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if path == 'users' and method == 'GET':
            role = params.get('role')
            if role:
                cur.execute("SELECT id, full_name, position, department, role, email FROM users WHERE role = %s ORDER BY full_name", (role,))
            else:
                cur.execute("SELECT id, full_name, position, department, role, email FROM users ORDER BY full_name")
            
            users = []
            for row in cur.fetchall():
                users.append({
                    'id': row[0],
                    'full_name': row[1],
                    'position': row[2],
                    'department': row[3],
                    'role': row[4],
                    'email': row[5]
                })
            
            return_response(conn, cur, {'users': users})
        
        elif path == 'instructions' and method == 'GET':
            category = params.get('category')
            industry = params.get('industry')
            
            query = "SELECT id, title, category, industry, profession, created_at, updated_at, status FROM instructions WHERE status = 'active'"
            query_params = []
            
            if category:
                query += " AND category = %s"
                query_params.append(category)
            if industry:
                query += " AND industry = %s"
                query_params.append(industry)
            
            query += " ORDER BY updated_at DESC"
            
            cur.execute(query, query_params)
            
            instructions = []
            for row in cur.fetchall():
                instructions.append({
                    'id': row[0],
                    'title': row[1],
                    'category': row[2],
                    'industry': row[3],
                    'profession': row[4],
                    'lastUpdated': row[6].strftime('%Y-%m-%d') if row[6] else row[5].strftime('%Y-%m-%d')
                })
            
            return return_response(conn, cur, {'instructions': instructions})
        
        elif path == 'instructions' and method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title')
            category = body_data.get('category')
            industry = body_data.get('industry')
            profession = body_data.get('profession')
            content = body_data.get('content')
            created_by = body_data.get('created_by', 1)
            
            cur.execute("""
                INSERT INTO instructions (title, category, industry, profession, content, created_by, status)
                VALUES (%s, %s, %s, %s, %s, %s, 'active')
                RETURNING id
            """, (title, category, industry, profession, content, created_by))
            
            instruction_id = cur.fetchone()[0]
            conn.commit()
            
            cur.execute("""
                INSERT INTO activity_log (user_id, action, subject)
                VALUES (%s, 'Создал инструкцию', %s)
            """, (created_by, title))
            conn.commit()
            
            return return_response(conn, cur, {'id': instruction_id, 'message': 'Instruction created'})
        
        elif path == 'programs' and method == 'GET':
            cur.execute("""
                SELECT p.id, p.title, p.description, p.duration_hours, p.passing_score,
                       COUNT(DISTINCT ua.user_id) as student_count,
                       COALESCE(AVG(CASE WHEN ts.status = 'completed' THEN ts.score END), 0) as avg_progress
                FROM training_programs p
                LEFT JOIN user_assignments ua ON ua.program_id = p.id
                LEFT JOIN test_sessions ts ON ts.user_id = ua.user_id
                WHERE p.status = 'active'
                GROUP BY p.id, p.title, p.description, p.duration_hours, p.passing_score
                ORDER BY p.title
            """)
            
            programs = []
            for row in cur.fetchall():
                programs.append({
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'duration': f'{row[3]} часов',
                    'passingScore': row[4],
                    'students': row[5] or 0,
                    'progress': int(row[6] or 0)
                })
            
            return return_response(conn, cur, {'programs': programs})
        
        elif path == 'assignments' and method == 'GET':
            user_id = params.get('user_id')
            
            if user_id:
                cur.execute("""
                    SELECT ua.id, tp.title, ua.deadline, ua.status, 
                           COALESCE(ts.score, 0) as progress
                    FROM user_assignments ua
                    JOIN training_programs tp ON tp.id = ua.program_id
                    LEFT JOIN test_sessions ts ON ts.user_id = ua.user_id AND ts.status = 'completed'
                    WHERE ua.user_id = %s
                    ORDER BY ua.deadline
                """, (user_id,))
            else:
                cur.execute("""
                    SELECT ua.id, u.full_name, tp.title, ua.deadline, ua.status
                    FROM user_assignments ua
                    JOIN users u ON u.id = ua.user_id
                    JOIN training_programs tp ON tp.id = ua.program_id
                    ORDER BY ua.deadline
                """)
            
            assignments = []
            for row in cur.fetchall():
                if user_id:
                    assignments.append({
                        'id': row[0],
                        'title': row[1],
                        'deadline': row[2].strftime('%Y-%m-%d') if row[2] else None,
                        'status': row[3],
                        'progress': row[4]
                    })
                else:
                    assignments.append({
                        'id': row[0],
                        'studentName': row[1],
                        'programTitle': row[2],
                        'deadline': row[3].strftime('%Y-%m-%d') if row[3] else None,
                        'status': row[4]
                    })
            
            return return_response(conn, cur, {'assignments': assignments})
        
        elif path == 'assignments' and method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            program_id = body_data.get('program_id')
            assigned_by = body_data.get('assigned_by', 1)
            deadline = body_data.get('deadline')
            
            cur.execute("""
                INSERT INTO user_assignments (user_id, program_id, assigned_by, deadline, status)
                VALUES (%s, %s, %s, %s, 'assigned')
                RETURNING id
            """, (user_id, program_id, assigned_by, deadline))
            
            assignment_id = cur.fetchone()[0]
            conn.commit()
            
            cur.execute("SELECT full_name FROM users WHERE id = %s", (user_id,))
            user_name = cur.fetchone()[0]
            
            cur.execute("SELECT title FROM training_programs WHERE id = %s", (program_id,))
            program_name = cur.fetchone()[0]
            
            cur.execute("""
                INSERT INTO activity_log (user_id, action, subject)
                VALUES (%s, 'Назначено обучение', %s)
            """, (user_id, program_name))
            conn.commit()
            
            return return_response(conn, cur, {
                'id': assignment_id,
                'message': f'Assignment created for {user_name}'
            })
        
        elif path == 'test-questions' and method == 'GET':
            instruction_id = params.get('instruction_id')
            
            if not instruction_id:
                return return_response(conn, cur, {'error': 'instruction_id required'}, 400)
            
            cur.execute("""
                SELECT id, question, option_a, option_b, option_c, option_d, correct_answer
                FROM test_questions
                WHERE instruction_id = %s
                ORDER BY id
            """, (instruction_id,))
            
            questions = []
            for row in cur.fetchall():
                questions.append({
                    'id': str(row[0]),
                    'question': row[1],
                    'options': [row[2], row[3], row[4], row[5]],
                    'correctAnswer': row[6]
                })
            
            return return_response(conn, cur, {'questions': questions})
        
        elif path == 'test-session' and method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            instruction_id = body_data.get('instruction_id')
            test_mode = body_data.get('test_mode', 'practice')
            answers = body_data.get('answers', [])
            time_spent = body_data.get('time_spent_seconds', 0)
            
            correct_count = 0
            total_questions = len(answers)
            
            cur.execute("""
                INSERT INTO test_sessions (user_id, instruction_id, test_mode, status, total_questions, time_spent_seconds, completed_at)
                VALUES (%s, %s, %s, 'completed', %s, %s, NOW())
                RETURNING id
            """, (user_id, instruction_id, test_mode, total_questions, time_spent))
            
            session_id = cur.fetchone()[0]
            
            for answer in answers:
                question_id = answer['question_id']
                user_answer = answer['user_answer']
                
                cur.execute("SELECT correct_answer FROM test_questions WHERE id = %s", (question_id,))
                correct_answer = cur.fetchone()[0]
                is_correct = user_answer == correct_answer
                
                if is_correct:
                    correct_count += 1
                
                cur.execute("""
                    INSERT INTO test_answers (session_id, question_id, user_answer, is_correct)
                    VALUES (%s, %s, %s, %s)
                """, (session_id, question_id, user_answer, is_correct))
            
            score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
            
            cur.execute("""
                UPDATE test_sessions
                SET score = %s, correct_answers = %s
                WHERE id = %s
            """, (score, correct_count, session_id))
            
            conn.commit()
            
            cur.execute("SELECT title FROM instructions WHERE id = %s", (instruction_id,))
            instruction_title = cur.fetchone()[0]
            
            cur.execute("""
                INSERT INTO activity_log (user_id, action, subject, details)
                VALUES (%s, %s, %s, %s)
            """, (user_id, 'Завершил тест' if score >= 80 else 'Провалил тест', instruction_title, f'Результат: {score}%'))
            conn.commit()
            
            return return_response(conn, cur, {
                'session_id': session_id,
                'score': score,
                'correct_answers': correct_count,
                'total_questions': total_questions,
                'passed': score >= 80
            })
        
        elif path == 'activity' and method == 'GET':
            limit = int(params.get('limit', 10))
            
            cur.execute("""
                SELECT al.id, u.full_name, al.action, al.subject, al.created_at
                FROM activity_log al
                JOIN users u ON u.id = al.user_id
                ORDER BY al.created_at DESC
                LIMIT %s
            """, (limit,))
            
            activities = []
            for row in cur.fetchall():
                activities.append({
                    'id': row[0],
                    'userName': row[1],
                    'action': row[2],
                    'subject': row[3],
                    'time': row[4].strftime('%Y-%m-%d %H:%M')
                })
            
            return return_response(conn, cur, {'activities': activities})
        
        elif path == 'stats' and method == 'GET':
            cur.execute("SELECT COUNT(*) FROM users WHERE role = 'student'")
            active_students = cur.fetchone()[0]
            
            cur.execute("SELECT COUNT(*) FROM test_sessions WHERE status = 'completed'")
            completed_tests = cur.fetchone()[0]
            
            cur.execute("SELECT COALESCE(AVG(score), 0) FROM test_sessions WHERE status = 'completed'")
            avg_score = int(cur.fetchone()[0])
            
            cur.execute("SELECT COUNT(*) FROM instructions WHERE status = 'active'")
            total_instructions = cur.fetchone()[0]
            
            return return_response(conn, cur, {
                'activeStudents': active_students,
                'completedTests': completed_tests,
                'avgScore': avg_score,
                'totalInstructions': total_instructions
            })
        
        else:
            return return_response(conn, cur, {'error': 'Invalid path or method'}, 404)
        
    except Exception as e:
        if 'conn' in locals():
            conn.rollback()
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
        
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }

def return_response(conn, cur, data: Dict[str, Any], status: int = 200) -> Dict[str, Any]:
    cur.close()
    conn.close()
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(data, ensure_ascii=False),
        'isBase64Encoded': False
    }
