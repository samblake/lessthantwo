
export interface ConnectParams {
    player: string
    name: string
    room: string
    action: Action
}

export interface Room {
    room: string
    state: State
    players: Player[]
    round: Round
    score: number
}

export interface Player {
    id: string
    name: string
    connectionId: string
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
    CREATE,
    JOIN
}

export interface WsResponse {
    statusCode: number,
    body: string
}
