import { WordGuess } from '../../types/types';
import { RowWordGuess } from '../RowWordGuess';

interface BoardGameProps {
    currGuess?: string;
    wordGuessList: WordGuess[];
    round: number;
    showLetter?: boolean;
}

export const BoardWords = ({
    currGuess,
    wordGuessList,
    round,
    showLetter = true
}: BoardGameProps) => {
    return (
        <div>
            {wordGuessList.map((wordGuess, index) => {
                const isCurrGuess = round === index;
                return isCurrGuess && showLetter ? (
                    <RowWordGuess
                        key={index}
                        currGuess={currGuess}
                        showLetter={showLetter}
                    />
                ) : (
                    <RowWordGuess
                        key={index}
                        guess={wordGuess}
                        showLetter={showLetter}
                    />
                );
            })}
        </div>
    );
};
