'use strict'

import { APIGatewayEventRequestContextWithAuthorizer } from "aws-lambda";
import { ApiGatewayManagementApi } from "aws-sdk";

export async function sendAll(requestContext: APIGatewayEventRequestContextWithAuthorizer<any>, connectionIds: string[], data: any) {
    const gatewayApi: ApiGatewayManagementApi = new ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: requestContext.domainName + "/" + requestContext.stage
    })

    const calls = connectionIds.map((connectionId) => send(gatewayApi, connectionId, data));
    await Promise.all(calls)
}

async function send(gatewayApi: ApiGatewayManagementApi, connectionId: string, data: any) {
    await gatewayApi.postToConnection({
        ConnectionId: connectionId,
        Data: data
    }).promise()
}
