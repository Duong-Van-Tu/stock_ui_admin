import { redirect } from 'next/navigation';

export default function SymbolRedirect({
  searchParams,
  params
}: {
  searchParams: { tvwidgetsymbol?: string };
  params: { locale: string };
}) {
  const raw = searchParams?.tvwidgetsymbol || '';
  const symbol = raw.split(':').pop()?.toUpperCase() || '';

  if (!symbol) {
    redirect(`/${params.locale}`);
  }

  redirect(`/${params.locale}/symbol/${symbol}`);
}
