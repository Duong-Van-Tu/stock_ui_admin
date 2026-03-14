import type { ComponentType, LazyExoticComponent, ReactNode } from 'react';

type GuardComponent = ComponentType<{ children: ReactNode } & Record<string, unknown>>;

type GuardablePage =
  | ComponentType<Record<string, unknown>>
  | LazyExoticComponent<ComponentType<Record<string, unknown>>>;

type WithGuardProps = {
  Page: GuardablePage;
  Guard: GuardComponent | GuardComponent[];
};

export function WithGuard({ Page, Guard }: WithGuardProps) {
  const guards = Array.isArray(Guard) ? Guard : [Guard];

  return guards.reduceRight(
    (children, GuardComponent) => {
      return <GuardComponent>{children}</GuardComponent>;
    },
    <Page />
  );
}
