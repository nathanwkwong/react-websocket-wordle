import { useEffect, useState } from 'react';
import { generateGameWord, isAlphabeticalInput } from '../../utils/utils';
import { WordGuess } from './interface';
import { UsedLetters } from '../Keyboard/interface';
import { ALL_WORDS } from '../../constants/gameWords';
import { GAME_CONFIG } from '../../constants/gameConfig';

export const useOnePlayerWordle = () => {
    const [round, setRound] = useState<number>(0);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);

    const [answer, setAnswer] = useState<string>('');
    const [currGuess, setCurrGuess] = useState<string>('');

    const [wordGuessList, setWordGuessList] = useState<WordGuess[]>([
        ...Array(GAME_CONFIG.maxRounds)
    ]);
    const [usedWords, setUsedWords] = useState<string[]>([]);
    const [usedLetters, setUsedLetters] = useState<UsedLetters>({});

    useEffect(() => {
        const newAnswer = generateGameWord();
        setAnswer(newAnswer);
        console.log('answer', newAnswer);
    }, []);

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
            if (round > GAME_CONFIG.maxRounds) {
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

            if (!ALL_WORDS.includes(currGuess)) {
                alert('Input word is not a real word, please clear and again');
                return;
            }

            const formattedGuessWord = formatGuessWord();
            addNewGuessWord(formattedGuessWord);
        }
    };

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);

        if (isCorrectAnswer) {
            alert('Correct, you win!');
            window.removeEventListener('keyup', handleKeyUp);
        }

        if (round >= GAME_CONFIG.maxRounds) {
            setTimeout(() => {
                alert(`Run out of gussess. You lose! Answer: ${answer}`);
            }, 2500);

            window.removeEventListener('keyup', handleKeyUp);
        }

        return () => window.removeEventListener('keyup', handleKeyUp);
    }, [handleKeyUp, isCorrectAnswer]);

    const formatGuessWord = () => {
        let answerArr: (string | null)[] = [...answer];
        let formattedGuessWord: WordGuess = [...currGuess].map(
            (letter: string) => {
                return { score: 'miss', letter };
            }
        );

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

    const addNewGuessWord = (formattedGuessWord: WordGuess) => {
        setWordGuessList((prevGuessList) => {
            const newGuesses = [...prevGuessList];
            newGuesses[round] = formattedGuessWord;
            return newGuesses;
        });

        setUsedWords((prevUsedWords) => [...prevUsedWords, currGuess]);
        setCurrGuess('');

        updateUsedLetters(formattedGuessWord);

        setRound((prevRound) => prevRound + 1);

        if (currGuess === answer) {
            setIsCorrectAnswer(true);
        }
    };

    return {
        round,
        currGuess,
        wordGuessList,
        isGameEnded: isCorrectAnswer || round >= GAME_CONFIG.maxRounds,
        usedLetters
    };
};
