import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { Spin } from 'antd';
import { createBrowserRouter } from 'react-router-dom';
import AuthGuard from '../guards/auth.guard';
import MainLayout from '../layouts/main.layout';
import { routePaths } from './router.paths';

const DashboardPage = lazy(() => import('../pages/dashboard.page'));
const LoginPage = lazy(() => import('../pages/login.page'));
const StocksPage = lazy(() => import('../pages/stocks.page'));
const NotFoundPage = lazy(() => import('../pages/not-found.page'));

function withSuspense(component: ReactNode) {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'grid', minHeight: '50vh', placeItems: 'center' }}>
          <Spin size='large' />
        </div>
      }
    >
      {component}
    </Suspense>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: routePaths.login.absolute,
    element: withSuspense(<LoginPage />),
  },
  {
    path: routePaths.dashboard.absolute,
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    errorElement: withSuspense(<NotFoundPage />),
    children: [
      {
        index: true,
        element: withSuspense(<DashboardPage />),
      },
      {
        path: routePaths.stocks.relative,
        element: withSuspense(<StocksPage />),
      },
    ],
  },
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);
