import React from 'react';
import BillingManagementPage from './pages/BillingManagementPage';

const InvoiceListPage    = React.lazy(() => import('./pages/InvoiceListPage'));
const ReceiptListPage    = React.lazy(() => import('./pages/ReceiptListPage'));
const CashBookPage       = React.lazy(() => import('./pages/CashBookPage'));
const DebtManagementPage = React.lazy(() => import('./pages/DebtManagementPage'));

const withSuspense = (el: React.ReactNode) => (
  <React.Suspense fallback={<div style={{ padding: 32, color: '#8a9fb0' }}>Đang tải...</div>}>
    {el}
  </React.Suspense>
);

export const billingRoutes = [
  {
    path: 'invoices',
    element: <BillingManagementPage />,
    children: [
      { index: true, element: withSuspense(<InvoiceListPage />) },
    ],
  },
  {
    path: 'receipts',
    element: <BillingManagementPage />,
    children: [
      { index: true, element: withSuspense(<ReceiptListPage />) },
    ],
  },
  {
    path: 'cashbook',
    element: <BillingManagementPage />,
    children: [
      { index: true, element: withSuspense(<CashBookPage />) },
    ],
  },
  {
    path: 'debts',
    element: <BillingManagementPage />,
    children: [
      { index: true, element: withSuspense(<DebtManagementPage />) },
      { path: 'patient', element: withSuspense(<DebtManagementPage />) },
      { path: 'supplier', element: withSuspense(<DebtManagementPage />) },
    ],
  },
  {
    path: 'billing',
    element: <BillingManagementPage />,
    children: [
      { index: true, element: withSuspense(<InvoiceListPage />) },
      { path: 'invoices', element: withSuspense(<InvoiceListPage />) },
      { path: 'receipts', element: withSuspense(<ReceiptListPage />) },
      { path: 'cashbook', element: withSuspense(<CashBookPage />) },
      { path: 'debts', element: withSuspense(<DebtManagementPage />) },
      { path: 'debts/patient', element: withSuspense(<DebtManagementPage />) },
      { path: 'debts/supplier', element: withSuspense(<DebtManagementPage />) },
    ],
  },
];
