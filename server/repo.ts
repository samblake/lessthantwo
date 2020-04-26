import {PromiseResult} from "aws-sdk/lib/request";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import {AWSError, DynamoDB} from "aws-sdk";

const TABLE = 'rooms'

const dynamo = new DynamoDB.DocumentClient()

export async function addConnection(connectionId: string): Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>> {
    console.log('Adding connection: ' + connectionId)
    return dynamo.put({
        TableName: TABLE,
        Item: {
            connectionId: connectionId
        }
    }).promise()
}

export async function removeConnection(connectionId: string): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> {
    console.log('Removing connection: ' + connectionId)
    return dynamo.delete({
        TableName: TABLE,
        Key: {
            connectionId: connectionId
        }
    }).promise()
}

export async function findConnections(): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> {
    console.log('Finding connections')
    return dynamo.scan({
        TableName: TABLE,
        ProjectionExpression: 'connectionId'
    }).promise()
}
