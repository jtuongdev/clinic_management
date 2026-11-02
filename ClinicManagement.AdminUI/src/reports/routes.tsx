import { RouteObject } from 'react-router-dom';
import SystemReportsPage from './pages/SystemReportsPage';

export const systemReportsRoutes: RouteObject[] = [
  {
    path: '/reports',
    element: <SystemReportsPage />,
  },
];
