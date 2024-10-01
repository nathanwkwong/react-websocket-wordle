import { useOnePlayerWordle } from './hook';
import { BoardWords } from '../BoardWords';
import { Keyboard } from '../Keyboard';

export const PanelGame = () => {
    const { currGuess, wordGuessList, round, usedLetters, isGameEnded } =
        useOnePlayerWordle();

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
