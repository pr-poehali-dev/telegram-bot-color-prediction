import json
import hashlib
import random
import string
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Find roulette key by brute-forcing SHA-1 hash
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
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
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
                'body': json.dumps({'error': 'Invalid hash format'})
            }
        
        charset = string.ascii_letters + string.digits + '+*%_-'
        max_attempts = 100000
        
        for number in range(37):
            for attempt in range(max_attempts // 37):
                random_part = ''.join(random.choices(charset, k=10))
                candidate_key = f"{number}|{random_part}"
                
                hash_obj = hashlib.sha1(candidate_key.encode('utf-8'))
                computed_hash = hash_obj.hexdigest()
                
                if computed_hash == target_hash:
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
                            'hash': target_hash
                        })
                    }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'found': False,
                'message': 'Key not found in current attempt range'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }
