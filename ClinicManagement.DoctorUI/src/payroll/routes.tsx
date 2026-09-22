import { type RouteObject } from 'react-router-dom';
import DoctorPayslipsPage from './pages/DoctorPayslipsPage';

export const payrollRoutes: RouteObject[] = [
  {
    path: 'payslips',
    element: <DoctorPayslipsPage />,
  },
];
