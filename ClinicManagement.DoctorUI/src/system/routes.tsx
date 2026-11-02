import { type RouteObject } from 'react-router-dom';
import SystemPage from './pages/ReportsPage';

export const systemRoutes: RouteObject[] = [
  {
    path: 'system',
    element: <SystemPage/>,
  },
];