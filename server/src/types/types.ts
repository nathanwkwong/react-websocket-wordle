export type LetterScore = 'hit' | 'present' | 'miss';

interface LetterGuess {
    letter: string;
    score: LetterScore;
}

export type WordGuess = LetterGuess[];

export interface CheckAnswerData {
    guess: string;
}
