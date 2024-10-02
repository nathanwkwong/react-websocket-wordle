import { Header } from '../../components/Header';
import { PanelGameOnePlayer } from '../../components/PanelGameOnePlayer';

export const PageOnePlayer = () => {
    return (
        <div>
            <Header title="You" />
            <PanelGameOnePlayer />
        </div>
    );
};
