import { ReactNode, useEffect } from 'react';
import { ApiFetcher } from '@/utils/api-service';
import { appEnvs } from '@/utils/env-mapper';

export function CurrentCtxInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const detectedEnv = appEnvs[window.location.host] || appEnvs.default;

      window.currentCtx = { appEnv: detectedEnv } as any;
      window.apiFetcher = new ApiFetcher(detectedEnv.apiHost);
    }
  }, []);

  return <>{children}</>;
}
