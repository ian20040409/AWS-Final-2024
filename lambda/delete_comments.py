import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Comments")

def lambda_handler(event, context):
    try:
        comment_id = event["pathParameters"]["comment_id"]
        body = json.loads(event["body"])
        username = body.get("username", "").strip()

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
                "body": json.dumps({"message": "您無權刪除此留言"})
            }

        # 刪除留言
        table.delete_item(
            Key={"comment_id": comment_id}
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "留言刪除成功"})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(e)})
        }