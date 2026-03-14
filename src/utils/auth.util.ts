import { AUTH_EVENTS, AUTH_STORAGE_KEYS } from '../constants/auth.constants';

export function getAccessToken() {
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
}

export function getRefreshToken() {
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
}

export function setAccessToken(token: string) {
  window.localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, token);
}

export function setRefreshToken(token: string) {
  window.localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, token);
}

export function clearAccessToken() {
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
}

export function clearRefreshToken() {
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
}

export function setAuthSession(loginUser: LoginUser) {
  setAccessToken(loginUser.accesstoken);
  setRefreshToken(loginUser.refreshtoken);
}

export function clearAuthSession() {
  clearAccessToken();
  clearRefreshToken();
}

export function emitAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENTS.changed));
}

export function subscribeAuthChange(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(AUTH_EVENTS.changed, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(AUTH_EVENTS.changed, onStoreChange);
  };
}
