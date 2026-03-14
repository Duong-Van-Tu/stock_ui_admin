import { useSyncExternalStore } from 'react';
import {
  clearAuthSession,
  emitAuthChange,
  getAccessToken,
  setAuthSession,
  subscribeAuthChange,
} from '../utils/auth.util';

function getSnapshot() {
  return getAccessToken();
}

export function useAuth() {
  const accessToken = useSyncExternalStore(subscribeAuthChange, getSnapshot, () => null);

  const login = (loginUser: LoginUser) => {
    setAuthSession(loginUser);
    emitAuthChange();
  };

  const logout = () => {
    clearAuthSession();
    emitAuthChange();
  };

  return {
    accessToken,
    isAuthenticated: Boolean(accessToken),
    login,
    logout,
  };
}
