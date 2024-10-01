import { GAME_CONFIG } from '../constants/gameConfig';
import { WordGuess } from '../types/types';

export const generateGameWord = () => {
    const randomIndex = Math.floor(
        Math.random() * GAME_CONFIG.gamePickedWords.length
    );
    return GAME_CONFIG.gamePickedWords[randomIndex];
};

export const isAlphabeticalInput = (input: string) => {
    return !!input.match(/^[A-Za-z]$/i);
};

export const formatGuessWord = (answer: string, currGuess: string) => {
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
