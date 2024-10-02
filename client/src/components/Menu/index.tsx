import { useState } from 'react';
import { Modal } from '../Modal';
import css from './styles.module.scss';

export const Menu = () => {
    const [showModal, setShowModal] = useState(false);
    return (
        <div className={css.container}>
            <ul>
                <li>
                    <span
                        className={css.menuItem}
                        onClick={() => setShowModal(true)}>
                        Home
                    </span>
                </li>
            </ul>
            {showModal && (
                <Modal setShowModal={setShowModal}>
                    <div>
                        <h3>Are you sure end of current game?</h3>
                        <div className={css.btnGroup}>
                            <button
                                onClick={() => {
                                    window.location.href = '/';
                                }}>
                                Yes
                            </button>
                            <button onClick={() => setShowModal(false)}>
                                No
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
