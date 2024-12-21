import json
import boto3
from datetime import datetime

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Comments")

def lambda_handler(event, context):
    try:
        body = json.loads(event["body"])
        comment_id = body["comment_id"]
        comment = body["comment"]
        url = body["url"]
        username = body.get("username", "匿名使用者")  # 獲取 username，若無則設為匿名

        # 儲存到 DynamoDB
        table.put_item(Item={
            "comment_id": comment_id,
            "username": username,  # 添加 username 欄位
            "comment": comment,
            "url": url,
            "created_at": datetime.utcnow().isoformat() + 'Z'  # 使用 UTC 時間並添加 Z 表示 UTC
        })

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "留言提交成功"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(e)})
        }