import { BoardWords } from '../BoardWords';
import { Keyboard } from '../Keyboard';
import { useWebScoketWordle } from '../../hooks/useWebSocketWordle';

export const PanelGame = () => {
    const { currGuess, wordGuessList, round, usedLetters, isGameEnded } =
        useWebScoketWordle();

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
