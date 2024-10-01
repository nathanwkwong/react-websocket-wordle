import { GAME_CONFIG } from '../constants/gameConfig';

export const generateGameWord = () => {
    const randomIndex = Math.floor(
        Math.random() * GAME_CONFIG.gamePickedWords.length
    );
    return GAME_CONFIG.gamePickedWords[randomIndex];
};

export const isAlphabeticalInput = (input: string) => {
    return !!input.match(/^[A-Za-z]$/i);
};
