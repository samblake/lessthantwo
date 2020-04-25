'use strict'

import  {config, ApiGatewayManagementApi, DynamoDB, AWSError } from "aws-sdk"
import { APIGatewayEvent } from "aws-lambda"
import { PromiseResult } from "aws-sdk/lib/request"
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client"

config.update({ region: "eu-west-1" })
const dynamo = new DynamoDB.DocumentClient()

const TABLE = 'rooms'

type Response = {
  statusCode: number,
  body: string
}

const successfulResponse = {
  statusCode: 200,
  body: "All good"
}

export async function connectHandler(event: APIGatewayEvent): Promise<Response> {
  console.log(event)
  try {
    await addConnection(event.requestContext.connectionId!)
    return successfulResponse
  }
  catch (err) {
    return errorResponse("Failed to connect", err)
  }
}

export async function disconnectHandler(event: APIGatewayEvent): Promise<Response> {
  console.log(event)
  try {
    await removeConnection(event.requestContext.connectionId!)
    return successfulResponse
  }
  catch (err) {
    return errorResponse("Failed to disconnect", err)
  }
}

export async function messageHandler(event: APIGatewayEvent): Promise<Response> {
  console.log(event)
  try {
    await sendMessage(event)
    return successfulResponse
  }
  catch (err) {
    return errorResponse("Failed to process message", err)
  }
}

export async function defaultHandler(event: APIGatewayEvent): Promise<Response> {
  console.log("defaultHandler was called: " + event)
  return successfulResponse
}


async function sendMessage(event: APIGatewayEvent): Promise<void> {
  const gatewayApi: ApiGatewayManagementApi = new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
  })

  const connectionData = await findConnections()
  const calls = connectionData.Items!.map(({ connectionId }) => send(gatewayApi, connectionId, event));

  await Promise.all(calls)
}

async function send(gatewayApi: ApiGatewayManagementApi, connectionId: string, event: APIGatewayEvent) {
    await gatewayApi.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.parse(event.body!).data
    }).promise()
}


async function addConnection(connectionId: string): Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>> {
  console.log('Adding connection: ' + connectionId)
  return dynamo.put({
    TableName: TABLE,
    Item: {
      connectionId: connectionId
    }
  }).promise()
}

async function removeConnection(connectionId: string): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> {
  console.log('Removing connection: ' + connectionId)
  return dynamo.delete({
    TableName: TABLE,
    Key: {
      connectionId: connectionId
    }
  }).promise()
}

async function findConnections(): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> {
  console.log('Finding connections')
  return dynamo.scan({
    TableName: TABLE,
    ProjectionExpression: 'connectionId'
  }).promise()
}


function errorResponse(message, err) {
  console.error(err)
  return {
    statusCode: 500,
    body: message + ": " + JSON.stringify(err)
  }
}
