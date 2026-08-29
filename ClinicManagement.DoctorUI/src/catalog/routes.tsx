import { type RouteObject } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';

export const catalogRoutes: RouteObject[] = [
  {
    path: 'catalog',
    element: <CatalogPage />,
  },
];