import MainLayout from '@/layout/main.layout';

export default function MainSectionLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
