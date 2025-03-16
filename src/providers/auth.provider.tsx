import { AuthContext } from '@/hooks/auth.hook';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getProfileUser, watchLoggedIn } from '@/redux/slices/auth.slice';
import { ReactNode, useEffect } from 'react';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(watchLoggedIn);
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(getProfileUser());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isLoggedIn: isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
