import { PageURLs } from '@/utils/navigate';
import { Button, Result } from 'antd';
import { useRouter } from 'next/navigation';

export function UnderDevelopment() {
  const router = useRouter();
  return (
    <Result
      status='403'
      title='Under Development'
      subTitle='This page is currently under development. Please check back later.'
      extra={
        <Button type='primary' onClick={() => router.push(PageURLs.ofIndex())}>
          Back Home
        </Button>
      }
    />
  );
}
