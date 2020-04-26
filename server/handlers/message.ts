import {APIGatewayEvent} from "aws-lambda";
import {WsResponse} from "../../common/types";
import {errorResponse, successfulResponse} from "./common";
import * as repo from "../repo";
import * as ws from "../ws";

export async function handle(event: APIGatewayEvent): Promise<WsResponse> {
    console.log(event)
    try {
        await sendMessage(event)
        return successfulResponse
    }
    catch (err) {
        return errorResponse("Failed to process message", err)
    }
}

async function sendMessage(event: APIGatewayEvent): Promise<void> {
    const data = JSON.parse(event.body!).data;
    const connectionData = await repo.findConnections()
    const connectionIds: string[] = connectionData.Items!.map(({ connectionId }) => connectionId);
    await ws.sendAll(event.requestContext, connectionIds, data);
}