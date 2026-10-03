// ClinicManagement.AdminUI › src › routes › AppRoutes.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import AuthLayout from '../Auth/pages/AuthLayout';
import Unauthorized from '../Auth/pages/Unauthorized';
import ProtectedRoute from './ProtectedRoute';

import { dashboardRoutes } from '../dashboard/routes';
import { MainLayout } from '../shared/components/layouts/MainLayout';
import { patientRoutes } from '../patient/routes';
import { examinationRoutes } from '../examination/routes';
import { employeeRoutes } from '../employee/routes';
import { appointmentRoutes } from '../appointment/routes';
import { inventoryRoutes } from '../inventory/routes';
import { billingRoutes } from '../billing/routes';
import { financeReportsRoutes } from '../finance-reports/routes';
import { settingsRoutes } from '../settings/routes';

const protectedRoutes = [
  {
    index: true,
    element: <Navigate to="/dashboard" replace />,
  },

  ...dashboardRoutes,
  ...patientRoutes,
  ...examinationRoutes,
  ...appointmentRoutes,
  ...employeeRoutes,
  ...inventoryRoutes,
  ...billingRoutes,
  ...financeReportsRoutes,
  ...settingsRoutes,
];

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  {
    path: '/login',
    element: <AuthLayout />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },

  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: protectedRoutes,
  },

  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export const AppRoutes = () => (
  <RouterProvider router={router} />
);
