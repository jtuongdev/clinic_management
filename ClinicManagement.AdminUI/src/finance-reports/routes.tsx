import React from 'react';
import FinanceReportsPage from './pages/FinanceReportsPage';

const withSuspense = (el: React.ReactNode) => (
  <React.Suspense fallback={<div style={{ padding: 32, color: '#8a9fb0' }}>Đang tải...</div>}>
    {el}
  </React.Suspense>
);

export const financeReportsRoutes = [
  {
    path: 'finance-reports',
    children: [
      { index: true, element: withSuspense(<FinanceReportsPage />) },
      { path: 'revenue', element: withSuspense(<FinanceReportsPage />) },
      { path: 'debt', element: withSuspense(<FinanceReportsPage />) },
      { path: 'income', element: withSuspense(<FinanceReportsPage />) },
    ],
  },
];
