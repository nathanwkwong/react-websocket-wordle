import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { GAME_CONFIG } from './constants/gameConfig';
import { formatGuessWord, generateGameWord } from './utils/utils';
import { roomData } from './constants/data';
import { CheckAnswerData } from './types/types';
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
    console.log('connected', socket.id);

    socket.on('new_game', () => {
        const newAnswer = generateGameWord();

        roomData[socket.id] = {
            answer: newAnswer
        };

        console.log('HERE IS: ', newAnswer, socket.id);

        const newGame = {
            maxRound: GAME_CONFIG.maxRounds
        };
        socket.emit('new_game', newGame);
    });

    socket.on('check_answer', (data: CheckAnswerData) => {
        const currGuess = data.guess;
        const answer = roomData[socket.id].answer;

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
            const formattedGuessWord = formatGuessWord(answer, currGuess);

            result = {
                isCorrect: answer === data.guess,
                guess: data.guess,
                answer: answer === data.guess ? answer : null,
                formattedGuessWord,
                validation: 'VALID'
            };
        }

        socket.emit('check_answer', result);
    });

    socket.on('disconnect', () => {
        console.log(`disconnect: ${socket.id}`);
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
