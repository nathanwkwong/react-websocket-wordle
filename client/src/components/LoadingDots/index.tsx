import css from './styles.module.scss';

export const LoadingDots = () => {
    return (
        <div className={css.progress}>
            <span className={css.indicator}></span>
            <span className={css.indicator}></span>
            <span className={css.indicator}></span>
        </div>
    );
};
