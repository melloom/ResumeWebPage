import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Resume from './pages/Resume';
import Projects from './pages/Projects';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/about',
    element: <About />,
  },
  {
    path: '/contact',
    element: <Contact />,
  },
  {
    path: '/resume',
    element: <Resume />,
  },
  {
    path: '/projects',
    element: <Projects />,
  },
  {
    path: '/admin',
    element: <AdminLogin />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;