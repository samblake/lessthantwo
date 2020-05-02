'use strict'

import { WsResponse } from "../../common/model";

export class successfulResponse implements WsResponse {
    statusCode: number = 200
    body: string

    constructor(body?: any) {
        this.body = body || "Success"
    }

}

export function jsonResponse(body: any) {
    return new successfulResponse(JSON.stringify(body))
}

export function errorResponse(message: string, err?: any) {
    console.error(err)
    return {
        statusCode: 500,
        body: message + (err === undefined ? "" : ": " + JSON.stringify(err))
    }
}
