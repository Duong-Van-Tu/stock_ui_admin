import { ComponentType, ReactNode } from 'react';

type WithGuardProps = {
  Page: ComponentType;
  Guard: ComponentType<{ children: ReactNode } & Record<string, any>>;
};

export function WithGuard({ Page, Guard }: WithGuardProps) {
  return (
    <Guard>
      <Page />
    </Guard>
  );
}
