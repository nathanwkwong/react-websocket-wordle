import css from './styles.module.scss';

interface HeaderProps {
    title: string;
}

export const Header = ({ title }: HeaderProps) => {
    return (
        <header className={css.container}>
            <h1 className={css.title}>{title}</h1>
        </header>
    );
};
