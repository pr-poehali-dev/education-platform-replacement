import json
import os
from typing import Dict, Any
from openai import OpenAI

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Генерация инструкций по охране труда с помощью GPT-4
    Args: event с httpMethod, body (type, profession, industry, additional_info)
    Returns: JSON с сгенерированной инструкцией
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
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        instruction_type = body_data.get('type', 'iot')
        profession = body_data.get('profession', '')
        industry = body_data.get('industry', '')
        additional_info = body_data.get('additional_info', '')
        
        if not profession:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Profession is required'}),
                'isBase64Encoded': False
            }
        
        client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))
        
        type_labels = {
            'iot': 'инструкцию по охране труда (ИОТ)',
            'job': 'должностную инструкцию',
            'equipment': 'инструкцию по эксплуатации оборудования'
        }
        
        prompt = f"""Создай подробную {type_labels.get(instruction_type, 'инструкцию')} для профессии "{profession}" в отрасли "{industry}".

Дополнительная информация: {additional_info if additional_info else 'Не указана'}

Структура инструкции должна включать:
1. Общие положения
2. Требования охраны труда перед началом работы
3. Требования охраны труда во время работы
4. Требования охраны труда в аварийных ситуациях
5. Требования охраны труда по окончании работы

Инструкция должна:
- Соответствовать актуальным нормам РФ
- Быть конкретной и применимой на практике
- Включать все основные риски и меры защиты
- Быть написана простым профессиональным языком

Формат ответа: JSON с полями title и content."""

        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[
                {
                    'role': 'system',
                    'content': 'Ты эксперт по охране труда, создающий инструкции в соответствии с российским законодательством.'
                },
                {'role': 'user', 'content': prompt}
            ],
            temperature=0.7,
            response_format={'type': 'json_object'}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'title': result.get('title', f'Инструкция для {profession}'),
                'content': result.get('content', ''),
                'profession': profession,
                'industry': industry,
                'type': instruction_type
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}, ensure_ascii=False),
            'isBase64Encoded': False
        }
