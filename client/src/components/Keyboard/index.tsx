import { KEY_GROUPS } from './constants';
import css from './styles.module.scss';
import { UsedLetters } from './interface';

interface KeyboardProps {
    usedLetters: UsedLetters;
}

export const Keyboard = ({ usedLetters }: KeyboardProps) => {
    return (
        <div className={css.container}>
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
