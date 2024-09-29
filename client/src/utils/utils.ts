import { GAME_WORDS } from '../constants/gameWords';

export const generateGameWord = () => {
    const randomIndex = Math.floor(Math.random() * GAME_WORDS.length);
    return GAME_WORDS[randomIndex].toLowerCase();
};
