import { type RouteObject } from 'react-router-dom';
import QueuePage from './components/QueuePanel';

export const queueRoutes: RouteObject[] = [
  {
    path: 'queue',
    element: <QueuePage/>,
  },
];