import css from './styles.module.scss';

interface ModalProps {
    message?: string;
    setShowModal: (showModal: boolean) => void;
    children?: React.ReactNode;
}

export const Modal = ({ message, setShowModal, children }: ModalProps) => {
    return (
        <div className={css.container}>
            <div className={css.innerWrapper}>
                <button
                    className={css.btnClose}
                    onClick={() => {
                        setShowModal(false);
                    }}>
                    X
                </button>
                {children}
                <h3 className={css.text}>{message}</h3>
            </div>
        </div>
    );
};
