export type RoomStatus =
    | 'waiting'
    | 'playing'
    | 'self_win'
    | 'opponent_win'
    | 'ended';

export interface JoinRoomTwoPlayersData {
    maxRound: number;
    status: RoomStatus;
    roomId: string;
}

export interface OpponentRunOutOfGuessData {
    answer: string;
}

export interface OpponentDisconnectData {
    answer: string;
}
