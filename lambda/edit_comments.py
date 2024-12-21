import json
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Comments")

def lambda_handler(event, context):
    try:
        # 從路徑參數中獲取 comment_id
        comment_id = event["pathParameters"]["comment_id"]
        
        # 解析請求體
        body = json.loads(event["body"])
        new_comment = body.get("comment", "").strip()
        username = body.get("username", "").strip()

        # 檢查留言內容和用戶名稱是否存在
        if not new_comment:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "留言內容不能為空"})
            }
        
        if not username:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "用戶名稱不能為空"})
            }

        # 檢索現有留言以確認擁有者
        response = table.get_item(
            Key={"comment_id": comment_id}
        )

        if "Item" not in response:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "留言未找到"})
            }

        existing_comment = response["Item"]

        if existing_comment.get("username") != username:
            return {
                "statusCode": 403,
                "body": json.dumps({"message": "您無權編輯此留言"})
            }

        # 更新留言內容和更新時間，使用表達式屬性名稱來避免保留關鍵字
        table.update_item(
            Key={"comment_id": comment_id},
            UpdateExpression="SET #c = :c, updated_at = :u",
            ExpressionAttributeNames={
                "#c": "comment"
            },
            ExpressionAttributeValues={
                ":c": new_comment,
                ":u": datetime.utcnow().isoformat() + 'Z'
            }
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "留言編輯成功"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(e)})
        }