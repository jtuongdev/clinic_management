import { EmployeeManagement } from './pages/EmployeeManagement';
import { ScheduleManagement } from './schedule/pages/ScheduleManagement';

export const employeeRoutes = [
  {
    path: 'employees',
    element: <EmployeeManagement />,
  },
  {
    path: 'schedules',
    element: <ScheduleManagement />,
  },
];
