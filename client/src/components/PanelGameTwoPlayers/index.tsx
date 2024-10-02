import { BoardWords } from '../BoardWords';
import { Header } from '../Header';
import { Keyboard } from '../Keyboard';
import { useWordleTwoPlayers } from './hook';
import css from './styles.module.scss';

export const PanelGameTwoPlayers = () => {
    const {
        currGuess,
        wordGuessList,
        opponentWordGuessList,
        opponentRound,
        round,
        usedLetters,
        isGameEnded,
        roomStatus
    } = useWordleTwoPlayers();

    const handlePlayAgain = () => {
        window.location.reload();
    };

    return (
        <div className={css.container}>
            <div className={css.boardWrapper}>
                <div>
                    <Header title="You" />
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
                    {roomStatus === 'waiting' && (
                        <div>Wait for another player</div>
                    )}
                    <Keyboard usedLetters={usedLetters} />
                </div>
                <div>
                    <Header title="Opponent" />
                    <BoardWords
                        showLetter={false}
                        currGuess={currGuess}
                        wordGuessList={opponentWordGuessList}
                        round={opponentRound}
                    />
                </div>
            </div>
        </div>
    );
};
