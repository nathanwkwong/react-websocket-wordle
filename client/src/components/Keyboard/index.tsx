import { KEY_GROUPS } from './constants';
import css from './styles.module.scss';
import { UsedLetters } from './interface';
import clsx from 'clsx';

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
                                    onClick={() => {
                                        const event = new KeyboardEvent(
                                            'keyup',
                                            {
                                                key: letter,
                                                code: `Key${letter.toUpperCase()}`,
                                                keyCode: letter
                                                    .toUpperCase()
                                                    .charCodeAt(0),
                                                charCode: letter
                                                    .toUpperCase()
                                                    .charCodeAt(0),
                                                which: letter
                                                    .toUpperCase()
                                                    .charCodeAt(0),
                                                bubbles: true
                                            }
                                        );
                                        document.dispatchEvent(event);
                                    }}
                                    className={clsx([
                                        css.key,
                                        css[`key-${usedLetters[letter]}`]
                                    ])}>
                                    {letter.length > 1
                                        ? letter
                                        : letter.toUpperCase()}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};
