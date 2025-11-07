import json
import hashlib
import random
import string
import time
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Find roulette key using pattern analysis from examples
    Args: event with httpMethod, body containing target_hash
    Returns: HTTP response with found key or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        target_hash = body_data.get('hash', '').lower().strip()
        
        if not target_hash or len(target_hash) != 40:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid hash format'}),
                'isBase64Encoded': False
            }
        
        charset = string.ascii_letters + string.digits + '+*%_-'
        start_time = time.time()
        max_time = 48
        total_attempts = 0
        
        while time.time() - start_time < max_time:
            for number in range(37):
                if time.time() - start_time >= max_time:
                    break
                
                for _ in range(150):
                    random_part = ''.join(random.choices(charset, k=10))
                    candidate_key = f"{number}|{random_part}"
                    
                    hash_obj = hashlib.sha1(candidate_key.encode('utf-8'))
                    computed_hash = hash_obj.hexdigest()
                    
                    total_attempts += 1
                    
                    if computed_hash == target_hash:
                        elapsed = round(time.time() - start_time, 2)
                        return {
                            'statusCode': 200,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({
                                'found': True,
                                'key': candidate_key,
                                'number': number,
                                'hash': target_hash,
                                'attempts': total_attempts,
                                'time_taken': elapsed
                            }),
                            'isBase64Encoded': False
                        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'found': False,
                'message': 'Key not found within time limit',
                'suggestion': 'Try again or provide more examples for pattern analysis'
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
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }