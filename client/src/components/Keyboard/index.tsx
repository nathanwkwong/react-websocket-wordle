import { KEY_GROUPS } from './constants';
import css from './styles.module.scss';
import { UsedLetters } from './interface';

interface KeyboardProps {
    usedLetters: UsedLetters;
    msgHint?: string;
}

export const Keyboard = ({ usedLetters, msgHint }: KeyboardProps) => {
    return (
        <div className={css.container}>
            <div className={css.msgHintWrapper}>
                {msgHint && <p className={css.msgHint}>{msgHint}</p>}
            </div>
            {KEY_GROUPS.map((keyGroup, index) => {
                return (
                    <div className={css.row} key={index}>
                        {keyGroup.map((letter) => {
                            return (
                                <div
                                    key={letter}
                                    className={
                                        css[`key-${usedLetters[letter]}`]
                                    }>
                                    {letter}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};
