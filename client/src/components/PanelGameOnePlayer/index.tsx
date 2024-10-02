import { BoardWords } from '../BoardWords';
import { Keyboard } from '../Keyboard';
import { useWordleOnePlayer } from './hook';

export const PanelGameOnePlayer = () => {
    const { currGuess, wordGuessList, round, usedLetters, isGameEnded } =
        useWordleOnePlayer();

    const handlePlayAgain = () => {
        window.location.reload();
    };

    return (
        <div>
            <BoardWords
                currGuess={currGuess}
                wordGuessList={wordGuessList}
                round={round}
            />
            {isGameEnded && (
                <button onClick={() => handlePlayAgain()}>
                    Play another round
                </button>
            )}
            <Keyboard usedLetters={usedLetters} />
        </div>
    );
};
