import { useEffect, useRef, useState } from 'react';
import { isAlphabeticalInput } from '../../utils/utils';
import {
    CheckAnswerData,
    OpponentCheckAnswerData,
    WordGuess
} from '../../types/types';
import { UsedLetters } from '../Keyboard/interface';
import {
    JoinRoomTwoPlayersData,
    OpponentDisconnectData,
    OpponentRunOutOfGuessData,
    RoomStatus
} from './types';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { socket } from '../../utils/socket';

export const useWordleTwoPlayers = () => {
    const hasEmittedNewGame = useRef(false);

    const [maxRound, setMaxRound] = useState<number>(
        GAME_CONFIG.defaultMaxRound
    );
    const [round, setRound] = useState<number>(0);
    const [opponentRound, setOpponentRound] = useState<number>(0);
    const [roomStatus, setRoomStatus] = useState<RoomStatus>('waiting');
    const [roomId, setRoomId] = useState<string>('');

    const [msgGameEnd, setMsgGameEnd] = useState<string>('');
    const [msgHint, setMsgHint] = useState<string>('');

    const [answer, setAnswer] = useState<string | null>(null);
    const [currGuess, setCurrGuess] = useState<string>('');

    const [wordGuessList, setWordGuessList] = useState<WordGuess[]>([
        ...Array(GAME_CONFIG.defaultMaxRound)
    ]);
    const [opponentWordGuessList, setOpponentWordGuessList] = useState<
        WordGuess[]
    >([...Array(GAME_CONFIG.defaultMaxRound)]);

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
        setMsgHint('');
    };

    useEffect(() => {
        if (!hasEmittedNewGame.current) {
            socket.emit('join_room_two_play');
            hasEmittedNewGame.current = true;
        }

        socket.on('join_room_two_play', (data: JoinRoomTwoPlayersData) => {
            setMaxRound(data.maxRound);
            setWordGuessList([...Array(data.maxRound)]);
            setOpponentWordGuessList([...Array(data.maxRound)]);
            setRoomStatus(data.status);
            setRoomId(data.roomId);
        });

        socket.on(
            'opponent_run_out_of_guess',
            (data: OpponentRunOutOfGuessData) => {
                setMsgGameEnd(
                    'You win! Opponent run out of guess. \n Answer: ' +
                        data.answer
                );
                setRoomStatus('self_win');
                setAnswer(data.answer);
            }
        );

        return () => {
            socket.off('join_room_two_play');
            socket.off('opponent_guess');
        };
    }, []);

    useEffect(() => {
        socket.on('opponent_guess', (data: OpponentCheckAnswerData) => {
            const { isCorrect, answer, maskedGuessWord } = data;

            addNewOppoentGuessWord(maskedGuessWord);
            setOpponentRound((prevRound) => prevRound + 1);
            setAnswer(answer);

            if (isCorrect) {
                setRoomStatus('opponent_win');
                setMsgGameEnd('Opponent guess correct! \n Answer: ' + answer);
            }
        });

        return () => {
            socket.off('opponent_guess');
        };
    }, [addNewOppoentGuessWord]);

    useEffect(() => {
        socket.on('check_answer_two_play', (data: CheckAnswerData) => {
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
                setRoomStatus('self_win');
                setMsgGameEnd('Correct, you win!');
            }

            setAnswer(answer);
        });

        return () => {
            socket.off('check_answer_two_play');
        };
    }, [addNewGuessWord]);

    useEffect(() => {
        socket.on('opponent_disconnected', (data: OpponentDisconnectData) => {
            if (
                roomStatus === 'self_win' ||
                roomStatus === 'opponent_win' ||
                roomStatus === 'waiting'
            ) {
                return;
            }

            setRoomStatus('self_win');
            setAnswer(data.answer);
            setMsgGameEnd('Opponent disconnected. \n Answer: ' + data.answer);
        });
    }, [roomStatus]);

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
            setMsgHint('');

            if (
                round > maxRound ||
                roomStatus === 'self_win' ||
                roomStatus === 'opponent_win'
            ) {
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

            if (currGuess.length !== GAME_CONFIG.wordLength) {
                setTimeout(() => {
                    setMsgHint(
                        `Input word need to be ${GAME_CONFIG.wordLength} characters`
                    );
                });
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
            setMsgGameEnd(`You lose! Run out of gussess. \n Answer: ${answer}`);
        }
    }, [round, maxRound]);

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);

        if (
            roomStatus === 'self_win' ||
            roomStatus === 'opponent_win' ||
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
            roomStatus === 'opponent_win' ||
            roomStatus === 'self_win' ||
            round >= maxRound,
        usedLetters,
        roomStatus,
        msgGameEnd,
        msgHint
    };
};
