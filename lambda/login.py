import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Users')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    username = body['username']
    password = body['password']

    # 驗證用戶
    response = table.scan(
        FilterExpression="username = :u AND password = :p",
        ExpressionAttributeValues={":u": username, ":p": password}
    )
    if not response['Items']:
        return {"statusCode": 400, "body": json.dumps({"message": "用戶名或密碼錯誤"})}

    user = response['Items'][0]
    return {"statusCode": 200, "body": json.dumps({"message": "登入成功", "user_id": user['user_id']})}
