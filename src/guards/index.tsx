import { ComponentType, ReactNode } from 'react';

type GuardComponent = ComponentType<
  { children: ReactNode } & Record<string, any>
>;

type WithGuardProps = {
  Page: ComponentType;
  Guard: GuardComponent | GuardComponent[];
};

export function WithGuard({ Page, Guard }: WithGuardProps) {
  const guards = Array.isArray(Guard) ? Guard : [Guard];

  const WrappedPage = guards.reduceRight((children, GuardComponent) => {
    return <GuardComponent>{children}</GuardComponent>;
  }, <Page />);

  return WrappedPage;
}
