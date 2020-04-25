'use strict'

import "reflect-metadata";
import { APIGatewayEvent } from "aws-lambda"
import { config, ApiGatewayManagementApi } from 'aws-sdk';

import { Model, DynamoStore, PartitionKey } from '@shiftcoders/dynamo-easy'

config.update({ region: "eu-west-1" })


type Response = {
  statusCode: number,
  body: string
}

@Model({tableName: 'rooms'})
class Room {
  @PartitionKey()
  connectionId: string;
}

const roomStore = new DynamoStore(Room)

const successfulResponse: Response = {
  statusCode: 200,
  body: "All good"
}

export async function connectHandler(event: APIGatewayEvent): Promise<Response> {
  console.log(event)
  try {
    await addConnection(event.requestContext.connectionId!)
    return successfulResponse
  }
  catch(err) {
    return errorResponse("Failed to connect", err)
  }
}

export async function disconnectHandler(event: APIGatewayEvent): Promise<Response> {
  console.log(event)
  try {
    await removeConnection(event.requestContext.connectionId!)
    return successfulResponse
  }
  catch(err) {
    return errorResponse("Failed to disconnect", err)
  }
}

export async function messageHandler(event: APIGatewayEvent): Promise<Response> {
  console.log(event)
  try {
    await sendMessage(event)
    return successfulResponse
  }
  catch(err) {
    return errorResponse("Failed to process message", err)
  }
}

export function defaultHandler(event: APIGatewayEvent): Response {
  console.log('defaultHandler was called: ' + event);
  return successfulResponse;
}


async function addConnection(connectionId: string): Promise<void> {
  console.log('Adding connection: ' + connectionId);
  try {
    await roomStore.put({connectionId: connectionId}).exec()
  }
  catch (err) {
    console.error("Could not store connection: " + err)
  }

  //const mapper = new DataMapper({client})
  //return mapper.put(Object.assign(new Room, {connectionId: connectionId}))
}

async function removeConnection(connectionId: string): Promise<void> {
  console.log('Removing connection: ' + connectionId);
  try {
    await roomStore.delete(connectionId).exec()
  }
  catch (err) {
    console.error("Could not store connection: " + err)
  }

  //const mapper = new DataMapper({client})
  //return mapper.delete(Object.assign(new Room, {connectionId: connectionId}))
}

async function sendMessage(event: APIGatewayEvent): Promise<void> {
  console.log("Looking for rooms")
  const rooms = await roomStore.scan().consistentRead(true).exec();
  console.log("Found " + rooms.length + " rooms")
  Promise.all(rooms.map(room => send(event, room.connectionId)))
}

async function send(event: APIGatewayEvent, connectionId: string): Promise<void> {
  console.log("Sending message to " + connectionId)

  const body: any = JSON.parse(event.body!)
  const data: string = body.data;

  const endpoint: string = event.requestContext.domainName + "/" + event.requestContext.stage;
  const managementApi: ApiGatewayManagementApi = new ApiGatewayManagementApi({apiVersion: "2018-11-29", endpoint: endpoint});

  try {
    await managementApi.postToConnection({
      Data: data,
      ConnectionId: connectionId,
    }).promise();
  }
  catch(err) {
    console.error("Could not send message to " + connectionId)
  }
}

function errorResponse(message: String, err: any): Response {
  console.error(err);
  return {
    statusCode: 500,
    body: message + ": " + JSON.stringify(err)
  };
}
