import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth.hook';
import { routePaths } from '../router/router.paths';

type AuthGuardProps = {
  children: ReactNode;
};

function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={routePaths.login.absolute} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export default AuthGuard;
