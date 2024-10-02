import { useEffect, useRef, useState } from 'react';

import { CheckAnswerData, WordGuess } from '../../types/types';
import { UsedLetters } from '../Keyboard/interface';
import { isAlphabeticalInput } from '../../utils/utils';
import { socket } from '../../utils/socket';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { JoinRoomOnePlayData } from './types';

export const useWordleOnePlayer = () => {
    const hasEmittedNewGame = useRef(false);

    const [maxRound, setMaxRound] = useState<number>(
        GAME_CONFIG.defaultMaxRound
    );
    const [round, setRound] = useState<number>(0);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);
    const [msgGameEnd, setMsgGameEnd] = useState<string>('');
    const [msgHint, setMsgHint] = useState<string>('');

    const [answer, setAnswer] = useState<string | null>(null);
    const [currGuess, setCurrGuess] = useState<string>('');

    const [wordGuessList, setWordGuessList] = useState<WordGuess[]>([
        ...Array(GAME_CONFIG.defaultMaxRound)
    ]);
    const [usedWords, setUsedWords] = useState<string[]>([]);
    const [usedLetters, setUsedLetters] = useState<UsedLetters>({});

    const addNewGuessWord = (formattedGuessWord: WordGuess, guess: string) => {
        setWordGuessList((prevGuessList) => {
            const newGuesses = [...prevGuessList];
            newGuesses[round] = formattedGuessWord;

            return newGuesses;
        });
        setUsedWords((prevUsedWords) => [...prevUsedWords, guess]);
        setCurrGuess('');
        setMsgHint('');

        updateUsedLetters(formattedGuessWord);

        setRound((prevRound) => prevRound + 1);
    };

    useEffect(() => {
        if (!hasEmittedNewGame.current) {
            socket.emit('join_room_one_play');
            hasEmittedNewGame.current = true;
        }

        socket.on('join_room_one_play', (data: JoinRoomOnePlayData) => {
            setMaxRound(data.maxRound);
            setWordGuessList([...Array(data.maxRound)]);
        });

        return () => {
            socket.off('join_room_one_play');
        };
    }, []);

    useEffect(() => {
        socket.on('check_answer', (data: CheckAnswerData) => {
            const { isCorrect, formattedGuessWord, answer, guess, validation } =
                data;

            if (validation === 'NOT_REAL_WORD') {
                setMsgHint(
                    'Input word is not a real word, please clear and again'
                );
                return;
            }
            addNewGuessWord(formattedGuessWord, guess);

            if (isCorrect) {
                setIsCorrectAnswer(true);
            }

            setAnswer(answer);
        });

        return () => {
            socket.off('check_answer');
        };
    }, [addNewGuessWord]);

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Backspace') {
            setCurrGuess((prevGuess) => {
                return prevGuess.slice(0, prevGuess.length - 1);
            });
        }

        if (isAlphabeticalInput(e.key) && currGuess.length < 5) {
            setCurrGuess((prevGuess) => {
                return prevGuess + e.key;
            });
        }

        if (e.key === 'Enter') {
            setMsgHint('');

            if (round > maxRound) {
                setTimeout(() => {
                    setMsgHint('Game Over');
                });
                return;
            }

            if (usedWords.includes(currGuess)) {
                setTimeout(() => {
                    setMsgHint('Duplicated Guess');
                });
                return;
            }

            if (currGuess.length !== 5) {
                setTimeout(() => {
                    setMsgHint('Input word need to be 5 characters');
                });
                return;
            }

            socket.emit('check_answer', {
                guess: currGuess,
                round
            });
        }
    };

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);

        if (isCorrectAnswer) {
            setMsgGameEnd('Correct, you win!');
            window.removeEventListener('keyup', handleKeyUp);
        }

        if (round >= maxRound) {
            setMsgGameEnd(`You lose! Run out of gussess. \n Answer: ${answer}`);
            window.removeEventListener('keyup', handleKeyUp);
        }

        return () => window.removeEventListener('keyup', handleKeyUp);
    }, [handleKeyUp, isCorrectAnswer]);

    const updateUsedLetters = (formattedGuessWord: WordGuess) => {
        setUsedLetters((prevUsedLetters) => {
            const newUsedLetters = { ...prevUsedLetters };

            formattedGuessWord.forEach((letter) => {
                const guessLetter = letter.letter;
                const guessScore = letter.score;

                const currScore = newUsedLetters[guessLetter];

                if (guessScore === 'hit') {
                    newUsedLetters[guessLetter] = 'hit';
                    return;
                }

                if (guessScore === 'present' && currScore !== 'hit') {
                    newUsedLetters[guessLetter] = 'present';
                    return;
                }

                if (
                    guessScore === 'miss' &&
                    currScore !== 'present' &&
                    currScore !== 'hit'
                ) {
                    newUsedLetters[guessLetter] = 'miss';
                    return;
                }
            });

            return newUsedLetters;
        });
    };

    return {
        round,
        currGuess,
        wordGuessList,
        isGameEnded: isCorrectAnswer || round >= maxRound,
        usedLetters,
        msgGameEnd,
        msgHint
    };
};
