'use client';

import { Button, Result } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function StockNotFound() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <Result
      status='404'
      title={t('notFoundTitle')}
      subTitle={t('stockNotFoundSubtitle')}
      extra={
        <Button type='primary' onClick={() => router.back()}>
          {t('stockNotFoundBack')}
        </Button>
      }
    />
  );
}
