import json
import boto3
from decimal import Decimal
import uuid
from datetime import datetime

# 初始化 DynamoDB 資源
dynamodb = boto3.resource('dynamodb')

# 定義兩個 DynamoDB 表
items_table = dynamodb.Table('http-crud-tutorial-items')
feedback_table = dynamodb.Table('Feedback')  # 新增的 Feedback 表

def lambda_handler(event, context):
    print(event)
    body = {}
    statusCode = 200
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"  # 啟用 CORS
    }

    try:
        route_key = event.get('routeKey', '')
        
        if route_key == "DELETE /items/{id}":
            item_id = event['pathParameters']['id']
            items_table.delete_item(Key={'id': item_id})
            body = {'message': f'Deleted item {item_id}'}
        
        elif route_key == "GET /items/{id}":
            item_id = event['pathParameters']['id']
            response = items_table.get_item(Key={'id': item_id})
            if 'Item' in response:
                item = response['Item']
                item['price'] = float(item['price'])  # 將 Decimal 轉換為 float
                body = item
            else:
                statusCode = 404
                body = {'error': 'Item not found'}
        
        elif route_key == "GET /items":
            response = items_table.scan()
            items = response.get('Items', [])
            for item in items:
                item['price'] = float(item['price'])  # 將 Decimal 轉換為 float
            body = items
        
        elif route_key == "PUT /items":
            requestJSON = json.loads(event['body'])
            items_table.put_item(
                Item={
                    'id': requestJSON['id'],
                    'price': Decimal(str(requestJSON['price'])),
                    'name': requestJSON['name']
                }
            )
            body = {'message': f'Put item {requestJSON["id"]}'}
        
        elif route_key == "POST /submit-feedback":
            requestJSON = json.loads(event['body'])
            name = requestJSON.get('name')
            email = requestJSON.get('email')
            message = requestJSON.get('message')
            
            # 檢查必要欄位
            if not all([name, email, message]):
                statusCode = 400
                body = {'error': 'Missing required fields'}
            else:
                # 生成唯一 ID 和時間戳記
                feedback_id = str(uuid.uuid4())
                timestamp = datetime.utcnow().isoformat()
                
                # 準備 DynamoDB 資料
                feedback_item = {
                    'id': feedback_id,
                    'name': name,
                    'email': email,
                    'message': message,
                    'timestamp': timestamp
                }
                
                # 將資料寫入 Feedback 表
                feedback_table.put_item(Item=feedback_item)
                
                body = {'message': '提交成功！感謝您的意見回饋！'}
        
        else:
            statusCode = 400
            body = {'error': f'Unsupported route: {route_key}'}
    
    except KeyError as e:
        statusCode = 400
        body = {'error': f'Unsupported route: {route_key}'}
    except Exception as e:
        print("Error:", str(e))
        statusCode = 500
        body = {'error': 'Internal Server Error'}
    
    # 準備回應
    response_body = json.dumps(body)
    res = {
        "statusCode": statusCode,
        "headers": headers,
        "body": response_body
    }
    return res