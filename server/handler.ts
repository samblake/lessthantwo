'use strict'

import { config } from "aws-sdk"
import { successfulResponse } from "./handlers/common";
import { APIGatewayEvent } from "aws-lambda"
import { WsResponse } from "../common/model"
import * as connect from "./handlers/connect"
import * as disconnect from "./handlers/disconnect"
import * as message from "./handlers/message"

config.update({ region: "eu-west-1" })


export async function connectHandler(event: APIGatewayEvent): Promise<WsResponse> {
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
  return new successfulResponse()
}