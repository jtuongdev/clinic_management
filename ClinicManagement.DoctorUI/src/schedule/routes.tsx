import { type RouteObject } from 'react-router-dom';
import DoctorSchedulePage from './pages/DoctorSchedulePage';

export const scheduleRoutes: RouteObject[] = [
  {
    path: 'schedule',
    element: <DoctorSchedulePage />,
  },
];
