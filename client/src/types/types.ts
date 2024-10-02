export type LetterScore = 'hit' | 'present' | 'miss';

interface LetterGuess {
    letter: string;
    score: LetterScore;
}

export type WordGuess = LetterGuess[];

export type GUESS_VALIDATION = 'NOT_REAL_WORD' | 'VALID' | 'INVALID';

export interface CheckAnswerData {
    isCorrect: boolean;
    formattedGuessWord: WordGuess;
    answer: string | null;
    guess: string;
    validation: GUESS_VALIDATION;
}

export interface OpponentCheckAnswerData {
    isCorrect: boolean;
    answer: string | null;
    maskedGuessWord: WordGuess;
}
