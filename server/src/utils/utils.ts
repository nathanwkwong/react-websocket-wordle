import { roomMap } from '../data/data';
import { GAME_CONFIG } from '../constants/gameConfig';
import { RoomData, WordGuess } from '../types/types';

export const generateGameWord = (): string => {
    const randomIndex = Math.floor(
        Math.random() * GAME_CONFIG.gamePickedWords.length
    );
    return GAME_CONFIG.gamePickedWords[randomIndex];
};

export const formatGuessWord = (
    answer: string,
    currGuess: string
): WordGuess => {
    let answerArr: (string | null)[] = [...answer];
    let formattedGuessWord: WordGuess = [...currGuess].map((letter: string) => {
        return { score: 'miss', letter };
    });

    formattedGuessWord.forEach((letter, index) => {
        const isLetterHit = answerArr[index] === letter.letter;
        if (isLetterHit) {
            formattedGuessWord[index].score = 'hit';
            answerArr[index] = null;
        }
    });

    formattedGuessWord.forEach((letter, index) => {
        const isLetterPresent = answerArr.includes(letter.letter);
        if (isLetterPresent && letter.score !== 'hit') {
            formattedGuessWord[index].score = 'present';
            answerArr[answerArr.indexOf(letter.letter)] = null;
        }
    });

    return formattedGuessWord;
};

export const findAvailableRoom = (): RoomData | null => {
    const roomKey = Object.keys(roomMap).find(
        (roomKey) => roomMap[roomKey].status === 'waiting'
    );

    return roomKey ? roomMap[roomKey] : null;
};
