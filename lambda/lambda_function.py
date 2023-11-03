import requests

def lambda_handler(event, context):
    cat_fact = requests.get("https://catfact.ninja/fact")
    return {
        "statusCode": 200,
        "body": cat_fact.json()
    }
