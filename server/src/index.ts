import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { GAME_CONFIG } from './constants/gameConfig';
import {
    findAvailableRoom,
    formatGuessWord,
    generateGameWord
} from './utils/utils';
import { roomMap } from './data/data';
import { CheckAnswerData, WordGuess } from './types/types';
import { ALL_WORDS } from './constants/gameWords';

const listCors = ['http://127.0.0.1:5173', 'http://localhost:5173'];

const app = express();
app.use(
    cors({
        origin: listCors
    })
);
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: listCors
    }
});

io.on('connection', (socket) => {
    console.log('A player connected to the server', socket.id);

    socket.on('join_room_one_play', () => {
        const playerId = socket.id;
        const newAnswer = generateGameWord();

        roomMap[socket.id] = {
            roomId: socket.id,
            answer: newAnswer,
            status: 'playing',
            playerOneId: playerId
        };

        console.log('A room created for one play', newAnswer, socket.id);

        const newGame = {
            maxRound: GAME_CONFIG.maxRound
        };
        socket.emit('join_room_one_play', newGame);
    });

    socket.on('check_answer', (data: CheckAnswerData) => {
        const currGuess = data.guess;
        const currRound = data.round;
        const answer = roomMap[socket.id].answer;

        let result = {};

        if (!ALL_WORDS.includes(currGuess)) {
            result = {
                isCorrect: false,
                answer: null,
                guess: data.guess,
                formattedGuessWord: [],
                validation: 'NOT_REAL_WORD'
            };
        } else {
            result = {
                isCorrect: answer === data.guess,
                guess: data.guess,
                answer:
                    answer === data.guess ||
                    currRound >= GAME_CONFIG.maxRound - 1
                        ? answer
                        : null,
                formattedGuessWord: formatGuessWord(answer, currGuess),
                validation: 'VALID'
            };
        }
        socket.emit('check_answer', result);
    });

    socket.on('join_room_two_play', () => {
        const playerId = socket.id;

        const availableRoom = findAvailableRoom();
        if (availableRoom) {
            const roomId = availableRoom.roomId;

            if (!availableRoom.playerOneId) {
                socket.emit('server_error');
                return;
            }

            socket.join(roomId);

            roomMap[roomId] = {
                ...availableRoom,
                playerTwoId: playerId,
                status: 'playing'
            };

            const newGame = {
                roomId,
                maxRound: GAME_CONFIG.maxRound,
                status: 'playing'
            };

            console.log(
                'A player joined a room for two play:',
                availableRoom.answer,
                roomId
            );

            socket.emit('join_room_two_play', {
                ...newGame,
                opponentHash: availableRoom.playerOneId.slice(0, 5)
            });

            io.to(availableRoom.playerOneId).emit('join_room_two_play', {
                ...newGame,
                opponentHash: playerId.slice(0, 5)
            });
        } else {
            const newRoomId = socket.id + '_room';
            const answer = generateGameWord();

            socket.join(newRoomId);

            roomMap[newRoomId] = {
                roomId: newRoomId,
                answer,
                playerOneId: playerId,
                status: 'waiting'
            };
            const newGame = {
                roomId: newRoomId,
                maxRound: GAME_CONFIG.maxRound,
                status: 'waiting'
            };
            console.log('A room created for two play:', answer, newRoomId);
            socket.emit('join_room_two_play', newGame);
        }
    });

    socket.on('run_out_of_guess', (data: CheckAnswerData) => {
        const roomId = data.roomId;
        const playerId = socket.id;

        const roomData = roomMap[roomId];

        if (!roomData) {
            socket.emit('server_error');
            return;
        }

        const opponentId =
            roomData.playerOneId === playerId
                ? roomData.playerTwoId
                : roomData.playerOneId;

        if (!opponentId) {
            socket.emit('server_error');
            return;
        }

        const result = {
            answer: roomData.answer
        };

        io.to(opponentId).emit('opponent_run_out_of_guess', result);
    });

    socket.on('check_answer_two_play', (data: CheckAnswerData) => {
        const playerId = socket.id;

        const currGuess = data.guess;
        const currRound = data.round;
        const roomId = data.roomId;

        const roomData = roomMap[roomId];

        if (!roomData) {
            socket.emit('server_error');
            return;
        }

        const answer = roomData.answer;

        const opponentId =
            roomData.playerOneId === playerId
                ? roomData.playerTwoId
                : roomData.playerOneId;

        if (!opponentId) {
            socket.emit('server_error');
            return;
        }

        if (!ALL_WORDS.includes(currGuess)) {
            const result = {
                isCorrect: false,
                answer: null,
                guess: data.guess,
                formattedGuessWord: [],
                validation: 'NOT_REAL_WORD'
            };
            socket.emit('check_answer_two_play', result);
        } else {
            const formattedGuessWord = formatGuessWord(answer, currGuess);
            const isCorrect = answer === data.guess;
            const answerResult =
                answer === data.guess || currRound >= GAME_CONFIG.maxRound - 1
                    ? answer
                    : null;

            const result = {
                isCorrect,
                guess: data.guess,
                answer: answerResult,
                formattedGuessWord,
                validation: 'VALID'
            };

            roomMap[roomId] = {
                ...roomData,
                status: 'end'
            };

            socket.emit('check_answer_two_play', result);

            const maskedGuessWord: WordGuess = formattedGuessWord.map(
                (letter) => {
                    return {
                        letter: '_',
                        score: letter.score
                    };
                }
            );

            const opponentResult = {
                isCorrect,
                answer,
                maskedGuessWord: maskedGuessWord
            };

            socket.to(opponentId).emit('opponent_guess', opponentResult);
        }
    });

    socket.on('disconnect', () => {
        const playerId = socket.id;
        console.log('A player disconnected', playerId);

        Object.keys(roomMap).forEach((roomKey) => {
            if (
                roomMap[roomKey].playerOneId === playerId ||
                roomMap[roomKey].playerTwoId === playerId
            ) {
                const opponentId =
                    roomMap[roomKey].playerOneId === playerId
                        ? roomMap[roomKey].playerTwoId
                        : roomMap[roomKey].playerOneId;

                if (!opponentId) {
                    socket.emit('server_error');
                    return;
                }

                socket.to(opponentId).emit('opponent_disconnected');
            }
        });
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
