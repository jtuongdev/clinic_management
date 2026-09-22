import RoleManagementPage from './pages/RoleManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import IntegrationConfigPage from './pages/IntegrationConfigPage';

export const settingsRoutes = [
  {
    path: '/settings/role',
    element: <RoleManagementPage />,
  },
  {
    path: '/settings/logs',
    element: <AuditLogPage />,
  },
  {
    path: '/settings/params',
    element: <IntegrationConfigPage />,
  },
];
