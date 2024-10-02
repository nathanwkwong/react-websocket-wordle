import { useEffect, useState } from 'react';
import { BoardWords } from '../BoardWords';
import { Keyboard } from '../Keyboard';
import { Modal } from '../Modal';
import { useWordleOnePlayer } from './hook';
import css from './styles.module.scss';

export const PanelGameOnePlayer = () => {
    const [showModal, setShowModal] = useState(false);

    const {
        currGuess,
        wordGuessList,
        round,
        usedLetters,
        isGameEnded,
        msgGameEnd,
        msgHint
    } = useWordleOnePlayer();

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
            {showModal && (
                <Modal message={msgGameEnd} setShowModal={setShowModal} />
            )}
        </div>
    );
};
