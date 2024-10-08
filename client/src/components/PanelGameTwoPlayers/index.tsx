import { useEffect, useState } from 'react';
import { BoardWords } from '../BoardWords';
import { BoardHeader } from '../BoardHeader';
import { Keyboard } from '../Keyboard';
import { Modal } from '../Modal';
import { useWordleTwoPlayers } from './hook';
import css from './styles.module.scss';
import { LoadingDots } from '../LoadingDots';

export const PanelGameTwoPlayers = () => {
    const [showModal, setShowModal] = useState(false);

    const {
        currGuess,
        wordGuessList,
        opponentWordGuessList,
        opponentRound,
        round,
        usedLetters,
        isGameEnded,
        roomStatus,
        msgGameEnd,
        msgHint,
        opponentHash,
        opponentMsgHint
    } = useWordleTwoPlayers();

    useEffect(() => {
        if (isGameEnded && msgGameEnd) {
            setShowModal(true);
        }
    }, [msgGameEnd, isGameEnded]);

    const handlePlayAgain = () => {
        window.location.reload();
    };

    return (
        <div className={css.container}>
            <div className={css.boardWrapper}>
                <div>
                    <BoardHeader title="You" />
                    <BoardWords
                        currGuess={currGuess}
                        wordGuessList={wordGuessList}
                        round={round}
                    />

                    {isGameEnded && (
                        <button
                            className={css.btnPlayAgain}
                            onClick={() => handlePlayAgain()}>
                            Play another round
                        </button>
                    )}

                    <Keyboard usedLetters={usedLetters} msgHint={msgHint} />
                </div>
                <div>
                    <BoardHeader
                        title={
                            opponentHash
                                ? `Opponent: ${opponentHash}`
                                : 'Opponent'
                        }
                    />
                    <BoardWords
                        showLetter={false}
                        currGuess={currGuess}
                        wordGuessList={opponentWordGuessList}
                        round={opponentRound}
                    />
                    {roomStatus === 'waiting' && (
                        <span className={css.msgMatching}>
                            Matching
                            <LoadingDots />
                        </span>
                    )}
                    {opponentMsgHint && (
                        <span className={css.msgMatching}>
                            {opponentMsgHint}
                        </span>
                    )}
                </div>
                {showModal && (
                    <Modal message={msgGameEnd} setShowModal={setShowModal} />
                )}
            </div>
        </div>
    );
};
