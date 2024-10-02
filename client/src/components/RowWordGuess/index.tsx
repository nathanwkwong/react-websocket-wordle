import clsx from 'clsx';
import { WordGuess } from '../../types/types';
import css from './styles.module.scss';

interface RowWordGuessProps {
    guess?: WordGuess;
    currGuess?: string;
    showLetter: boolean;
}

export const RowWordGuess = ({
    guess,
    currGuess,
    showLetter
}: RowWordGuessProps) => {
    if (currGuess) {
        return (
            <div className={clsx([css.container, css.current])}>
                {currGuess.split('').map((letter, index) => {
                    return (
                        <div key={index} className={css.filled}>
                            {showLetter ? letter : ''}
                        </div>
                    );
                })}

                {Array.from({ length: 5 - currGuess.length }).map(
                    (_, index) => {
                        return <div key={index}></div>;
                    }
                )}
            </div>
        );
    }

    if (!guess) {
        return (
            <div className={css.container}>
                {Array.from({ length: 5 }).map((_, index) => {
                    return <div key={index}></div>;
                })}
            </div>
        );
    }

    return (
        <div className={css.container}>
            {guess.map((letter, index) => {
                return (
                    <div key={index} className={css[`score-${letter.score}`]}>
                        {showLetter ? letter.letter : ''}
                    </div>
                );
            })}
        </div>
    );
};
