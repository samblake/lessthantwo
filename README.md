# Less Than Two

An online cooperative party game.

## Deploying 

Configure you AWS credentials ([more details](https://www.serverless.com/framework/docs/providers/aws/guide/credentials#using-aws-profiles)):

    serverless config credentials

Deploy to AWS:

    sls deploy -v

## Development

Run locally:

    serverless offline --stage local
    
DynamoDB will be running on `http://localhost:8000`.

You can use `wscat` to connect to the server:

    wscat -c ws://localhost:3001?id=123\&room=abc
    
And send messages:

    {"action":"message", "data":test"}
