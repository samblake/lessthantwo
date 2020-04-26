import {WsResponse} from "../../common/types";

export const successfulResponse: WsResponse = {
    statusCode: 200,
    body: "All good"
}

export function errorResponse(message, err) {
    console.error(err)
    return {
        statusCode: 500,
        body: message + ": " + JSON.stringify(err)
    }
}
