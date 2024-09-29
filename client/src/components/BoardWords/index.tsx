import { WordGuess } from '../PanelGame/interface';
import { RowWordGuess } from '../RowWordGuess';

interface BoardGameProps {
    currGuess: string;
    wordGuessList: WordGuess[];
    round: number;
}

export const BoardWords = ({
    currGuess,
    wordGuessList,
    round
}: BoardGameProps) => {
    return (
        <div>
            {wordGuessList.map((wordGuess, index) => {
                const isCurrGuess = round === index;
                return isCurrGuess ? (
                    <RowWordGuess key={index} currGuess={currGuess} />
                ) : (
                    <RowWordGuess key={index} guess={wordGuess} />
                );
            })}
        </div>
    );
};
