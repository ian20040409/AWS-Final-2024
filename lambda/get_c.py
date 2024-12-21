import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Comments")

def lambda_handler(event, context):
    try:
        query_params = event["queryStringParameters"]
        url = query_params["url"]

        # Scan 篩選 url
        response = table.scan(
            FilterExpression="#u = :url",
            ExpressionAttributeNames={"#u": "url"},
            ExpressionAttributeValues={":url": url}
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"comments": response["Items"]})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(e)})
        }
