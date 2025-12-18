import json
import os
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление инструкциями: получение, создание, обновление
    Args: event с httpMethod, queryStringParameters (path, id), body
    Returns: JSON с результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    
    conn = None
    cursor = None
    
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        path = query_params.get('path', '')
        instruction_id = query_params.get('id', '')
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'DATABASE_URL not configured'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        if method == 'GET':
            if path == 'instructions':
                cursor.execute('''
                    SELECT id, title, category, industry, profession, last_updated 
                    FROM instructions 
                    ORDER BY last_updated DESC
                ''')
                rows = cursor.fetchall()
                
                instructions = []
                for row in rows:
                    instructions.append({
                        'id': row[0],
                        'title': row[1],
                        'category': row[2],
                        'industry': row[3],
                        'profession': row[4],
                        'lastUpdated': row[5]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'instructions': instructions}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            
            elif path == 'instruction' and instruction_id:
                cursor.execute('''
                    SELECT id, title, category, industry, profession, content, last_updated 
                    FROM instructions 
                    WHERE id = %s
                ''', (instruction_id,))
                row = cursor.fetchone()
                
                if not row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Instruction not found'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                instruction = {
                    'id': row[0],
                    'title': row[1],
                    'category': row[2],
                    'industry': row[3],
                    'profession': row[4],
                    'content': row[5],
                    'lastUpdated': row[6]
                }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'instruction': instruction}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            request_path = body_data.get('path', '')
            
            if request_path == 'update-instruction':
                instruction_id = body_data.get('id')
                title = body_data.get('title')
                content = body_data.get('content')
                
                if not all([instruction_id, title, content]):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing required fields'}, ensure_ascii=False),
                        'isBase64Encoded': False
                    }
                
                cursor.execute('''
                    UPDATE instructions 
                    SET title = %s, content = %s, last_updated = NOW() 
                    WHERE id = %s
                ''', (title, content, instruction_id))
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Instruction updated'}, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()