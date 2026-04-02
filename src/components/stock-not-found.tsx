'use client';

import { Result } from 'antd';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { BackButton } from './back-button';

export default function StockNotFound() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <Result
      status='404'
      title={t('notFoundTitle')}
      subTitle={t('stockNotFoundSubtitle')}
      extra={
        <BackButton
          onClick={() => router.back()}
          label={t('stockNotFoundBack')}
          size='large'
        />
      }
    />
  );
}
