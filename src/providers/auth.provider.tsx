import Loading from '@/components/loading';
import { AuthContext } from '@/hooks/auth.hook';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getProfileUser,
  watchAuthLoading,
  watchLoggedIn
} from '@/redux/slices/auth.slice';
import { ReactNode, useEffect, useState } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(watchLoggedIn);
  const loading = useAppSelector(watchAuthLoading);
  const [delayedLoading, setDelayedLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      const timeout = setTimeout(() => {
        setDelayedLoading(false);
      }, 1000);

      dispatch(getProfileUser());

      return () => clearTimeout(timeout);
    } else {
      setDelayedLoading(false);
    }
  }, [dispatch, isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isLoggedIn: isAuthenticated }}>
      {(loading || delayedLoading) && <Loading />}
      {children}
    </AuthContext.Provider>
  );
};
