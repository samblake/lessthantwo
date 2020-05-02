import { PromiseResult } from "aws-sdk/lib/request"
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client"
import { AWSError, DynamoDB } from "aws-sdk"
import { Entity, Player, Room } from "../common/model"

const TABLE = 'rooms'

const local = process.env.isLocal! == "true";
const localOptions = {
    region: "localhost",
    endpoint: "http://localhost:8000"
}

const dynamo = local ? new DynamoDB.DocumentClient(localOptions) : new DynamoDB.DocumentClient()

export async function addConnection(connectionId: string): Promise<PromiseResult<DocumentClient.PutItemOutput, AWSError>> {
    console.log('Adding connection: ' + connectionId)
    return dynamo.put({
        TableName: TABLE,
        Item: {
            connectionId: connectionId
        }
    }).promise()
}

export async function removeConnection(connectionId: string): Promise<PromiseResult<DocumentClient.DeleteItemOutput, AWSError>> {
    console.log('Removing connection: ' + connectionId)
    return dynamo.delete({
        TableName: TABLE,
        Key: {
            connectionId: connectionId
        }
    }).promise()
}

export async function findConnections(): Promise<PromiseResult<DocumentClient.ScanOutput, AWSError>> {
    console.log('Finding connections')
    return dynamo.scan({
        TableName: TABLE,
        ProjectionExpression: 'connectionId'
    }).promise()
}

/**
 * Creates a new room. If a room with the specified ID already exists returns an error.
 */
export async function createRoom(player: Player, roomId: string): Promise<Room | string> {
    const room = new Room(roomId, player);
    return createEntity(TABLE, room)
}

/**
 * Finds the room with the specified ID. If no room exists with that ID returns null.
 */
export function findRoom(roomId: string): Promise<Room> {
    return findEntity(TABLE, roomId)
}

/**
 * Updates the room with the given ID to the room supplied. An error is returned if optimistic locking checks fail.
 */
export function updateRoom(room: Room): Promise<Room> {
    return updateEntity(TABLE, room)
}

export async function createEntity<T extends Entity>(table: string, entity: T): Promise<T | string> {

    const result = await dynamo.put({
        TableName: table,
        Item: entity,
        ConditionExpression: "attribute_not_exists(id)"
    }).promise()

    const httpResponse = result.$response.httpResponse

    if (httpResponse.statusCode != 200) {
        return httpResponse.statusMessage
    }

    return entity
}

async function findEntity<T extends Entity>(table: string, id: string): Promise<T> {
    const result = await dynamo.get({
        TableName: table,
        Key: { id: id }
    }).promise()

    const httpResponse = result.$response.httpResponse

    if (httpResponse.statusCode != 200) {
        throw new Error(httpResponse.statusMessage)
    }

    console.log(result.Item)
    return result.Item as T
}

async function updateEntity<T extends Entity>(table: string, entity: T): Promise<T> {
    const currentVersion = entity.version
    entity.version++

    const result = await dynamo.put({
        TableName: table,
        Item: entity,
        ConditionExpression: "version = :currentVersion",
        ExpressionAttributeValues: { ":currentVersion": currentVersion }
    }).promise()

    const httpResponse = result.$response.httpResponse

    if (httpResponse.statusCode != 200) {
        throw new Error(httpResponse.statusMessage)
    }

    return entity
}