import { Result } from 'antd';
import { useRouter } from 'next/navigation';
import { BackButton } from './back-button';

export function UnderDevelopment() {
  const router = useRouter();
  return (
    <Result
      status='403'
      title='Under Development'
      subTitle='This page is currently under development. Please check back later.'
      extra={
        <BackButton onClick={() => router.back()} label='Go Back' size='large' />
      }
    />
  );
}
