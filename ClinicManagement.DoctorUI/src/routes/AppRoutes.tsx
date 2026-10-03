import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom';

import MainLayout from '../shared/components/layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

import AuthLayout from '../Auth/pages/AuthLayout';
import Unauthorized from '../Auth/pages/Unauthorized';

import { dashboardRoutes } from '../dashboard/routes';
import { queueRoutes } from '../queue/routes';
import { examRoutes } from '../examination/routes';
import { recordsRoutes } from '../records/routes';
import { catalogRoutes } from '../catalog/routes';
import { reportsRoutes } from '../reports/routes';
import { systemRoutes } from '../system/routes';
import { scheduleRoutes } from '../schedule/routes';
import { payrollRoutes } from '../payroll/routes';
import { appointmentRoutes } from '../appointment/routes';

// Hàm hợp nhất routes
const mergeRoutes = (...routesArrays: any[]) =>
  routesArrays.flat();

export const router = createBrowserRouter([
  // ==========================================
  // LOGIN
  // ==========================================
  {
    path: '/login',
    element: <AuthLayout />,
  },

  // ==========================================
  // KHU VỰC BÁC SĨ
  // ==========================================
  {
    path: '/',
    element: (
      <ProtectedRoute roles={['BacSi', 'BAC_SI', 'BAC_SI_KHAM_BENH', 'QUAN_TRI_HE_THONG', 'ADMIN']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Trang mặc định
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      // Dashboard
      ...mergeRoutes(
        dashboardRoutes,

        // Lịch làm việc & Chấm công
        scheduleRoutes,

        // Lịch hẹn bệnh nhân
        appointmentRoutes,

        // Bảng lương & Thu nhập
        payrollRoutes,

        // Hàng đợi
        queueRoutes,

        // Khám bệnh
        examRoutes,

        // Hồ sơ bệnh án
        recordsRoutes,

        // Danh mục
        catalogRoutes,

        // Báo cáo
        reportsRoutes,

        // Hệ thống
        systemRoutes
      ),

      // Route không tồn tại
      {
        path: '/unauthorized',
        element: <Unauthorized />,
      },
    ],
  },

  // ==========================================
  // FALLBACK
  // ==========================================
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);