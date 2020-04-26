import { errorResponse, successfulResponse } from "./common";
import { WsResponse } from "../../common/types";
import * as repo from "../repo"
import { APIGatewayEvent } from "aws-lambda"

export async function handle(event: APIGatewayEvent): Promise<WsResponse> {
    console.log(event)
    try {
        await repo.addConnection(event.requestContext.connectionId!)
        return successfulResponse
    }
    catch (err) {
        return errorResponse("Failed to connect", err)
    }
}
