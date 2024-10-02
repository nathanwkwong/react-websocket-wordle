import css from './styles.module.scss';

interface BoardHeaderProps {
    title: string;
}

export const BoardHeader = ({ title }: BoardHeaderProps) => {
    return (
        <header className={css.container}>
            <h1 className={css.title}>{title}</h1>
        </header>
    );
};
