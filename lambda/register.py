import json
import boto3
import uuid

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Users')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    username = body['username']
    email = body['email']
    password = body['password']

    # 檢查用戶名是否存在
    existing_user = table.scan(
        FilterExpression="username = :u",
        ExpressionAttributeValues={":u": username}
    )
    if existing_user['Items']:
        return {"statusCode": 400, "body": json.dumps({"message": "用戶名已存在"})}

    # 創建新用戶
    user_id = str(uuid.uuid4())
    table.put_item(Item={
        "user_id": user_id,
        "username": username,
        "email": email,
        "password": password
    })
    return {"statusCode": 200, "body": json.dumps({"message": "註冊成功", "user_id": user_id})}

