import { Header } from './Header';
import css from './styles.module.scss';

export const PageHome = () => {
    return (
        <div className={css.container}>
            <Header title="Wordle" />
            <a href="/one-player">
                <button className={css.btnLink}>One Player</button>
            </a>
            <a href="/two-players">
                <button className={css.btnLink}>Two Players</button>
            </a>
        </div>
    );
};
