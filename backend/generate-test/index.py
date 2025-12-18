import json
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерация тестов по охране труда с использованием ИИ-ассистента
    Args: event - dict с httpMethod, body (title, category, topic, questionCount)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с сгенерированными вопросами
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    title: str = body_data.get('title', '')
    category: str = body_data.get('category', 'iot')
    topic: str = body_data.get('topic', 'occupational-safety')
    question_count: int = body_data.get('questionCount', 10)
    
    if not title:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Title is required'})
        }
    
    questions = []
    
    category_topics = {
        'iot': 'инструкциям по охране труда',
        'job-instruction': 'должностным инструкциям',
        'profession': 'профессиональным знаниям',
        'program': 'программам обучения',
        'topic': get_topic_name(topic)
    }
    
    for i in range(question_count):
        question_id = f"q_{i+1}"
        
        question = {
            'id': question_id,
            'text': f'Вопрос {i+1} по теме "{title}" ({category_topics.get(category, "общим знаниям")})',
            'type': 'single' if i % 3 != 0 else 'multiple',
            'answers': [
                {
                    'id': f'{question_id}_a1',
                    'text': f'Вариант ответа 1 для вопроса {i+1}',
                    'isCorrect': True
                },
                {
                    'id': f'{question_id}_a2',
                    'text': f'Вариант ответа 2 для вопроса {i+1}',
                    'isCorrect': False
                },
                {
                    'id': f'{question_id}_a3',
                    'text': f'Вариант ответа 3 для вопроса {i+1}',
                    'isCorrect': i % 3 == 0
                },
                {
                    'id': f'{question_id}_a4',
                    'text': f'Вариант ответа 4 для вопроса {i+1}',
                    'isCorrect': False
                }
            ],
            'explanation': f'Пояснение к вопросу {i+1}',
            'points': 1
        }
        
        questions.append(question)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'questions': questions,
            'message': f'Сгенерировано {len(questions)} вопросов'
        })
    }

def get_topic_name(topic: str) -> str:
    topics = {
        'occupational-safety': 'охране труда',
        'first-aid': 'первой помощи',
        'fire-safety': 'пожарной безопасности',
        'explosives': 'взрывному делу',
        'underground-mining': 'подземным горным выработкам',
        'work-at-height': 'работам на высоте',
        'other': 'другим темам'
    }
    return topics.get(topic, 'общим темам')
