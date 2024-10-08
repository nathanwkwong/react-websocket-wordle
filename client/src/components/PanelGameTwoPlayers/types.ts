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
    opponentHash: string;
}

export interface OpponentRunOutOfGuessData {
    answer: string;
}
