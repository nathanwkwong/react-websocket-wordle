export type LetterScore = 'hit' | 'present' | 'miss';

interface LetterGuess {
    letter: string;
    score: LetterScore;
}

export type WordGuess = LetterGuess[];

export interface CheckAnswerData {
    roomId: string;
    guess: string;
    round: number;
}

type RoomStatus = 'waiting' | 'playing' | 'end';

export interface RoomMap {
    [roomKey: string]: RoomData;
}

export interface RoomData {
    roomId: string;
    answer: string;
    status: RoomStatus;
    playerOneId?: string;
    playerTwoId?: string;
}
