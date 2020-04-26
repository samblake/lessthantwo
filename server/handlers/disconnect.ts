import {errorResponse, successfulResponse } from "./common";
import {WsResponse} from "../../common/types";
import {APIGatewayEvent} from "aws-lambda";
import * as repo from "../repo"

export async function handle(event: APIGatewayEvent): Promise<WsResponse> {
    console.log(event)
    try {
        await repo.removeConnection(event.requestContext.connectionId!)
        return successfulResponse
    }
    catch (err) {
        return errorResponse("Failed to disconnect", err)
    }
}