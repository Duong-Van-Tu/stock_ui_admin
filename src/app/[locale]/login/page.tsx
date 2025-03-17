'use client';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageURLs } from '@/utils/navigate';
import AuthLayout from '@/layout/auth.layout';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginUser, watchAuthLoading } from '@/redux/slices/auth.slice';

const { Text } = Typography;

type LoginFormValues = LoginUserParams & {
  remember?: boolean;
};

export default function Login() {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(watchAuthLoading);

  const onFinish = (values: LoginFormValues) => {
    dispatch(loginUser(values));
    router.push(PageURLs.ofIndex());
  };

  return (
    <AuthLayout title={t('login')}>
      <Form name='login-form' onFinish={onFinish} layout='vertical'>
        <Form.Item
          label={<span css={formLabelStyles}>{t('username')}</span>}
          name='username'
          rules={[{ required: true, message: t('pleaseEnterUsername') }]}
        >
          <Input
            prefix={<UserOutlined />}
            size='large'
            placeholder={t('enterUsername')}
          />
        </Form.Item>
        <Form.Item
          label={<span css={formLabelStyles}>{t('password')}</span>}
          name='password'
          rules={[{ required: true, message: t('pleaseEnterPassword') }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size='large'
            placeholder={t('enterPassword')}
          />
        </Form.Item>
        <Form.Item name='remember' valuePropName='checked'>
          <Checkbox>{t('rememberMe')}</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button
            loading={loading}
            size='large'
            type='primary'
            htmlType='submit'
            block
          >
            {t('login')}
          </Button>
        </Form.Item>
      </Form>
      <Text>
        {t('registerPromptStart')}{' '}
        <a onClick={() => router.push('/register')}>
          {t('registerPromptLink')}
        </a>
      </Text>
    </AuthLayout>
  );
}

const formLabelStyles = css`
  font-weight: 500;
  font-size: 1.6rem;
`;
