'use strict'

import { errorResponse, successfulResponse } from "./common";
import { WsResponse } from "../../common/model";
import { APIGatewayEvent } from "aws-lambda";
import { getConnectionId } from "../utils";
import * as repo from "../repo"

export async function handle(event: APIGatewayEvent): Promise<WsResponse> {
    console.log(event)
    try {
        await repo.removeConnection(getConnectionId(event))
        return new successfulResponse()
    }
    catch (err) {
        return errorResponse("Failed to disconnect", err)
    }
}