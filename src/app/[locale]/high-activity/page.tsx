'use client';
import MainLayout from '@/layout/main.layout';
import { PageURLs } from '@/utils/navigate';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

export default function AlertLogs() {
  const router = useRouter();
  return (
    <MainLayout>
      <Result
        status='403'
        title='Under Development'
        subTitle='This page is currently under development. Please check back later.'
        extra={
          <Button
            type='primary'
            onClick={() => router.push(PageURLs.ofIndex())}
          >
            Back Home
          </Button>
        }
      />
    </MainLayout>
  );
}
