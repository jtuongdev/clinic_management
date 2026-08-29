// ClinicManagement.AdminUl › src › routes › AppRoutes.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

import AuthLayout from '../Auth/pages/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

import { dashboardRoutes } from '../dashboard/routes';
import { MainLayout } from '../shared/components/layouts/MainLayout';
import { patientRoutes } from '../patient/routes';
import { examinationRoutes } from '../examination/routes';

const protectedRoutes = [
  {
    index: true,
    element: <Navigate to="/dashboard" replace />,
  },

  ...dashboardRoutes,
  ...patientRoutes,
  ...examinationRoutes,
];

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
  },

  {
    path: '/',
    element: (
      <ProtectedRoute roles={['Admin']}>
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