import { BoardHeader } from '../../components/BoardHeader';
import { Menu } from '../../components/Menu';
import { PanelGameOnePlayer } from '../../components/PanelGameOnePlayer';

export const PageOnePlayer = () => {
    return (
        <div>
            <Menu />
            <BoardHeader title="You" />
            <PanelGameOnePlayer />
        </div>
    );
};
