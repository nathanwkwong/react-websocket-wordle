import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PageHome } from './pages/Home';
import { PageOnePlayer } from './pages/OnePlayer';
import { PageTwoPlayer } from './pages/TwoPlayer';
import css from './styles.module.scss';

const router = createBrowserRouter([
    {
        path: '/',
        element: <PageHome />
    },
    {
        path: '/one-player',
        element: <PageOnePlayer />
    },
    {
        path: '/two-players',
        element: <PageTwoPlayer />
    },
    {
        path: '*',
        element: <div>404</div>
    }
]);

function App() {
    return (
        <div className={css.container}>
            <RouterProvider router={router} />
        </div>
    );
}

export default App;
