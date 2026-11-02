import { lazy } from 'react';

// Lazy load để tối ưu
const ExamPage = lazy(() => import('./pages/ExamPage'));

export const examRoutes = {
  path: 'exam',
  element: <ExamPage />,
};

export default examRoutes;