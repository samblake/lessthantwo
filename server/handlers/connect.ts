'use strict'

import { errorResponse, jsonResponse } from "./common"
import { Action, ConnectParams, Player, WsResponse } from "../../common/model"
import { APIGatewayEvent } from "aws-lambda"
import { getConnectionId } from "../utils"
import * as repo from "../repo"

export async function handle(event: APIGatewayEvent): Promise<WsResponse> {

    const params = event.queryStringParameters as Partial<ConnectParams>
    if (!paramsSupplied(params)) {
        return errorResponse("Required parameters missing")
    }

    const player = Player.from(getConnectionId(event), params)
    console.log(player)

    try {
        switch (params.action) {
            case Action.CREATE: {
                const room = await createRoom(player, params.room)
                return jsonResponse(room)
            }
            case Action.JOIN: {
                const room = await joinRoom(player, params.room)
                return jsonResponse(room)
            }
        }
    }
    catch (err) {
        return errorResponse("Failed to connect", err)
    }

}

async function createRoom(player: Player, roomId: string): Promise<WsResponse> {
    const result = await repo.createRoom(player, roomId);
    if (result instanceof String) {
        switch (result) {
            case 'ConditionalCheckFailedException': return {
                statusCode: 422,
                body: "Room already exists"
            }
            default: return {
                statusCode: 500,
                body: result as string
            }
        }
    }
    return jsonResponse(result)
}

async function joinRoom(player: Player, roomId: string): Promise<WsResponse> {
    const room = await repo.findRoom(roomId);

    if (room === undefined) {
        return {
            statusCode: 404,
            body: `Room ${roomId} could not be found`
        }
    }

    // TODO handle rejoining players
    if (room.players.some(p => p.id === player.id)) {
        throw new Error("You are already in the room")
    }

    if (room.players.some(p => p.name === player.name)) {
        throw new Error("Someone with your name is already in the room")
    }

    room.players.push(player)
    repo.updateRoom(room)
    console.log(room)
    return jsonResponse(room)
}

function paramsSupplied(params: Partial<ConnectParams>): params is ConnectParams {
    return params.player !== undefined && params.name !== undefined
        && params.room !== undefined && isAction(params.action)
}

function isAction(action: Action | undefined): action is Action {
    return action !== undefined && Object.values(Action).includes(action)
}
