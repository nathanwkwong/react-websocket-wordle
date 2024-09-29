import css from './styles.module.scss';

export const PageHome = () => {
    return (
        <div className={css.container}>
            <a href="/one-player">one player</a>
            <a href="/two-players">two players</a>
        </div>
    );
};
