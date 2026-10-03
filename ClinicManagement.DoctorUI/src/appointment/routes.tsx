import { type RouteObject } from 'react-router-dom';
import DoctorAppointmentPage from './pages/DoctorAppointmentPage';

export const appointmentRoutes: RouteObject[] = [
  {
    path: 'appointments',
    element: <DoctorAppointmentPage />,
  },
  {
    path: 'appointment',
    element: <DoctorAppointmentPage />,
  },
];
