declare interface Window {
  currentCtx: {
    appEnv: import('@/utils/env-mapper').AppEnv;
  };
  apiFetcher: import('@/utils/api-service').ApiFetcher;
}

declare const apiFetcher: Window['apiFetcher'];
declare const currentCtx: Window['currentCtx'];
