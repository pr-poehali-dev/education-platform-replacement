import json
import os
import base64
import boto3
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Загружает видеофайл в S3 хранилище
    Args: event - dict с httpMethod, body (base64 видео), headers
          context - объект с request_id, function_name
    Returns: HTTP response с URL загруженного видео
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Program-Id, X-Module-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        headers = event.get('headers', {})
        program_id = headers.get('X-Program-Id', 'unknown')
        module_id = headers.get('X-Module-Id', 'unknown')
        
        body = event.get('body', '')
        if event.get('isBase64Encoded', False):
            video_data = base64.b64decode(body)
        else:
            body_json = json.loads(body)
            video_base64 = body_json.get('videoData', '')
            filename = body_json.get('filename', 'video.mp4')
            video_data = base64.b64decode(video_base64)
        
        s3_client = boto3.client(
            's3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        file_extension = filename.split('.')[-1] if 'filename' in locals() else 'mp4'
        file_key = f'videos/{program_id}/{module_id}/{context.request_id}.{file_extension}'
        
        content_type = 'video/mp4'
        if file_extension == 'webm':
            content_type = 'video/webm'
        elif file_extension == 'mov':
            content_type = 'video/quicktime'
        
        s3_client.put_object(
            Bucket='files',
            Key=file_key,
            Body=video_data,
            ContentType=content_type
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'url': cdn_url,
                'fileKey': file_key,
                'size': len(video_data)
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': str(e)
            }),
            'isBase64Encoded': False
        }
