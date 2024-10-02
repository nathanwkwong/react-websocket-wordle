import { Header } from '../../components/Header';
import { Menu } from '../../components/Menu';
import { PanelGameOnePlayer } from '../../components/PanelGameOnePlayer';

export const PageOnePlayer = () => {
    return (
        <div>
            <Menu />
            <Header title="You" />
            <PanelGameOnePlayer />
        </div>
    );
};
