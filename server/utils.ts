'use strict'

import { APIGatewayProxyEventBase } from "aws-lambda"

export function getConnectionId(event: APIGatewayProxyEventBase<any>): string {
  return event.requestContext.connectionId!
}