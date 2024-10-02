import { useEffect, useRef, useState } from 'react';
import { isAlphabeticalInput } from '../../utils/utils';
import {
    CheckAnswerData,
    OpponentCheckAnswerData,
    WordGuess
} from '../../types/types';
import { UsedLetters } from '../Keyboard/interface';
import { RoomStatus } from './types';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { socket } from '../../utils/socket';

export const useWordleTwoPlayers = () => {
    const hasEmittedNewGame = useRef(false);

    const [maxRound, setMaxRound] = useState<number>(5);
    const [round, setRound] = useState<number>(0);
    const [opponentRound, setOpponentRound] = useState<number>(0);
    const [roomStatus, setRoomStatus] = useState<RoomStatus>('waiting');
    const [roomId, setRoomId] = useState<string>('');

    const [answer, setAnswer] = useState<string | null>(null);
    const [currGuess, setCurrGuess] = useState<string>('');

    const [wordGuessList, setWordGuessList] = useState<WordGuess[]>([]);
    const [opponentWordGuessList, setOpponentWordGuessList] = useState<
        WordGuess[]
    >([]);
    const [usedWords, setUsedWords] = useState<string[]>([]);
    const [usedLetters, setUsedLetters] = useState<UsedLetters>({});

    const addNewOppoentGuessWord = (formattedGuessWord: WordGuess) => {
        setOpponentWordGuessList((prevGuessList) => {
            const newGuesses = [...prevGuessList];
            newGuesses[opponentRound] = formattedGuessWord;

            return newGuesses;
        });
    };

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
            socket.emit('join_room_two_play');
            hasEmittedNewGame.current = true;
        }

        socket.on('join_room_two_play', (data: any) => {
            console.log('join_room_two_play', data);
            setMaxRound(data.maxRound);
            setWordGuessList([...Array(data.maxRound)]);
            setOpponentWordGuessList([...Array(data.maxRound)]);
            setRoomStatus(data.status);
            setRoomId(data.roomId);
        });

        socket.on('opponent_disconnected', (data: any) => {
            console.log('HERE IS: ', roomStatus);
            if (
                roomStatus === 'self_win' ||
                roomStatus === 'oppoent_win' ||
                roomStatus === 'waiting'
            ) {
                return;
            }

            setRoomStatus('self_win');
            setAnswer(data.answer);

            alert('Opponent disconnected, answer: ' + data.answer);
        });

        socket.on('opponent_run_out_of_guess', (data: any) => {
            alert('Opponent run out of guess, answer: ' + data.answer);
            setRoomStatus('self_win');
            setAnswer(data.answer);
        });

        return () => {
            socket.off('join_room_two_play');
            socket.off('opponent_guess');
        };
    }, [addNewOppoentGuessWord]);

    useEffect(() => {
        socket.on('opponent_guess', (data: OpponentCheckAnswerData) => {
            const { isCorrect, answer, maskedGuessWord } = data;

            addNewOppoentGuessWord(maskedGuessWord);
            setOpponentRound((prevRound) => prevRound + 1);
            setAnswer(answer);

            if (isCorrect) {
                setRoomStatus('oppoent_win');
                alert('Opponent win! Answer: ' + answer);
            }
        });
    }, [addNewOppoentGuessWord, setOpponentRound]);

    useEffect(() => {
        socket.on('check_answer_two_play', (data: CheckAnswerData) => {
            const { isCorrect, formattedGuessWord, answer, guess, validation } =
                data;

            if (validation === 'NOT_REAL_WORD') {
                alert('Input word is not a real word, please clear and again');
                return;
            }
            addNewGuessWord(formattedGuessWord, guess);

            if (isCorrect) {
                setRoomStatus('self_win');
                alert('Correct, you win!');
            }

            setAnswer(answer);
        });

        return () => {
            socket.off('check_answer_two_play');
        };
    }, [addNewGuessWord]);

    const handleKeyUp = (e: KeyboardEvent) => {
        if (roomStatus === 'waiting') {
            return;
        }

        if (e.key === 'Backspace') {
            setCurrGuess((prevGuess) => {
                return prevGuess.slice(0, prevGuess.length - 1);
            });
        }

        if (
            isAlphabeticalInput(e.key) &&
            currGuess.length < GAME_CONFIG.wordLength
        ) {
            setCurrGuess((prevGuess) => {
                return prevGuess + e.key;
            });
        }

        if (e.key === 'Enter') {
            if (
                round > maxRound ||
                roomStatus === 'self_win' ||
                roomStatus === 'oppoent_win'
            ) {
                console.log('Game Over');
                return;
            }

            if (usedWords.includes(currGuess)) {
                alert('Duplicated Guess');
                return;
            }

            if (currGuess.length !== GAME_CONFIG.wordLength) {
                console.log(
                    `Input word need to be ${GAME_CONFIG.wordLength} characters`
                );
                return;
            }

            socket.emit('check_answer_two_play', {
                roomId,
                guess: currGuess,
                round
            });
        }
    };

    useEffect(() => {
        if (round >= maxRound) {
            socket.emit('run_out_of_guess', {
                roomId
            });
            alert(`Run out of gussess. You lose! Answer: ${answer}`);
        }
    }, [round, maxRound]);

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);

        if (
            roomStatus === 'self_win' ||
            roomStatus === 'oppoent_win' ||
            round >= maxRound
        ) {
            window.removeEventListener('keyup', handleKeyUp);
        }

        return () => window.removeEventListener('keyup', handleKeyUp);
    }, [handleKeyUp, roomStatus, answer]);

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
        opponentRound,
        currGuess,
        wordGuessList,
        opponentWordGuessList,
        isGameEnded:
            roomStatus === 'oppoent_win' ||
            roomStatus === 'self_win' ||
            round >= maxRound,
        usedLetters,
        roomStatus
    };
};
