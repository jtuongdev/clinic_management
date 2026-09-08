import React from 'react';
import InventoryManagement from './pages/InventoryManagement';

const ItemCatalogPage = React.lazy(() => import('./pages/ItemCatalogPage'));
const StockPage       = React.lazy(() => import('./pages/StockPage'));
const ImportPage      = React.lazy(() => import('./pages/ImportPage'));
const DispensePage    = React.lazy(() => import('./pages/DispensePage'));
const StocktakePage   = React.lazy(() => import('./pages/StocktakePage'));
const SupplierPage    = React.lazy(() => import('./pages/SupplierPage').then(m => ({ default: m.SupplierPage })));

const withSuspense = (el: React.ReactNode) => (
  <React.Suspense fallback={<div style={{ padding: 32, color: '#8a9fb0' }}>Đang tải...</div>}>
    {el}
  </React.Suspense>
);

export const inventoryRoutes = [
  {
    path: 'inventory',
    element: <InventoryManagement />,
    children: [
      { index: true,        element: withSuspense(<ItemCatalogPage />) },
      { path: 'stock',      element: withSuspense(<StockPage />) },
      { path: 'import',     element: withSuspense(<ImportPage />) },
      { path: 'dispense',   element: withSuspense(<DispensePage />) },
      { path: 'stocktake',  element: withSuspense(<StocktakePage />) },
      { path: 'suppliers',  element: withSuspense(<SupplierPage />) },

    ],
  },
];
