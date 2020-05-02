
export interface Entity {
    id: string
    version: number
}

export interface WsResponse {
    statusCode: number,
    body: string
}

export interface ConnectParams {
    player: string
    name: string
    room: string
    action: Action
}


export interface Room extends Entity {
    state: State
    players: Player[]
    round: Round | null
    score: number
}

export class Room implements Room {

    constructor(id: string, player: Player) {
        this.id = id
        this.version = 0
        this.state = State.OPEN
        this.players = [player]
        this.round = null
        this.score = 0
    }

}

export interface Player {
    id: string
    name: string
    connectionId: string
}

export class Player implements Player {

    constructor(id: string, name: string, connectionId: string) {
        this.id = id
        this.name = name
        this.connectionId = connectionId
    }

    static from(connectionId: string, params: ConnectParams): Player {
        return new Player(params.player, params.name, connectionId)
    }

}

export interface Round {
    player: string
    word: string
    hints: string[]
    guess: string
}

export enum State {
    OPEN,
    CLOSED
}

export enum Action {
    CREATE = "CREATE",
    JOIN = "JOIN"
}