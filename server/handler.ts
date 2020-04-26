'use strict'

import  {config } from "aws-sdk"
import { APIGatewayEvent } from "aws-lambda"
import {ConnectParams, Action, WsResponse} from "../common/types"
import * as connect from "./handlers/connect"
import * as disconnect from "./handlers/disconnect"
import * as message from "./handlers/message"
import {successfulResponse} from "./handlers/common";

config.update({ region: "eu-west-1" })


export async function connectHandler(event: APIGatewayEvent): Promise<WsResponse> {
  const params: ConnectParams = {
    player: event.queryStringParameters!['id'],
    name: event.queryStringParameters!['name'],
    room: event.queryStringParameters!['room'],
    action: Action[event.queryStringParameters!['action']]
  }
  console.log(params)

  return await connect.handle(event)
}

export async function disconnectHandler(event: APIGatewayEvent): Promise<WsResponse> {
  return await disconnect.handle(event)
}

export async function messageHandler(event: APIGatewayEvent): Promise<WsResponse> {
  return await message.handle(event)
}

export async function defaultHandler(event: APIGatewayEvent): Promise<WsResponse> {
  console.log("defaultHandler was called: " + event)
  return successfulResponse
}