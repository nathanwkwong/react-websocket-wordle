import { useEffect, useRef, useState } from 'react';
import { isAlphabeticalInput } from '../utils/utils';
import { CheckAnswerData, WordGuess } from '../components/PanelGame/interface';
import { UsedLetters } from '../components/Keyboard/interface';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

export const useWebScoketWordle = () => {
    const hasEmittedNewGame = useRef(false);

    const [maxRound, setMaxRound] = useState<number>(5);
    const [round, setRound] = useState<number>(0);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);

    const [answer, setAnswer] = useState<string | null>(null);
    const [currGuess, setCurrGuess] = useState<string>('');

    const [wordGuessList, setWordGuessList] = useState<WordGuess[]>([]);
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

        updateUsedLetters(formattedGuessWord);

        setRound((prevRound) => prevRound + 1);
    };

    useEffect(() => {
        if (!hasEmittedNewGame.current) {
            socket.emit('new_game', {
                message: 'new_game'
            });
            hasEmittedNewGame.current = true;
        }

        socket.on('new_game', (data: any) => {
            console.log('onNewGame', data);
            setMaxRound(data.maxRound);
            setWordGuessList([...Array(data.maxRound)]);
        });

        return () => {
            socket.off('new_game');
        };
    }, []);

    useEffect(() => {
        socket.on('check_answer', (data: CheckAnswerData) => {
            const { isCorrect, formattedGuessWord, answer, guess, validation } =
                data;

            if (validation === 'NOT_REAL_WORD') {
                alert('Input word is not a real word, please clear and again');
                return;
            }

            if (isCorrect) {
                setIsCorrectAnswer(true);
                setAnswer(answer);
            }

            addNewGuessWord(formattedGuessWord, guess);
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
            if (round > maxRound) {
                console.log('Game Over');
                return;
            }

            if (usedWords.includes(currGuess)) {
                alert('Duplicated Guess');
                return;
            }

            if (currGuess.length !== 5) {
                console.log('Input word need to be 5 characters');
                return;
            }

            socket.emit('check_answer', {
                guess: currGuess
            });
        }
    };

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);

        if (isCorrectAnswer) {
            alert('Correct, you win!');
            window.removeEventListener('keyup', handleKeyUp);
        }

        if (round >= maxRound) {
            setTimeout(() => {
                alert(`Run out of gussess. You lose! Answer: ${answer}`);
            }, 2500);

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
        usedLetters
    };
};
