import {type RouteObject } from 'react-router-dom';
import RecordsPage from './pages/RecordsPage';

export const recordsRoutes: RouteObject[] = [
  {
    path: 'records',
    element: <RecordsPage />,
  },
];