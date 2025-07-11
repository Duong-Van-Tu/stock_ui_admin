'use client';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  ConfigProvider
} from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
// import { useRouter, useSearchParams } from 'next/navigation';
import { PageURLs } from '@/utils/navigate';
import AuthLayout from '@/layout/auth.layout';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginUser, watchAuthLoading } from '@/redux/slices/auth.slice';
import Link from 'next/link';
import { createStyles } from 'antd-style';

const { Text } = Typography;

type LoginFormValues = LoginUserParams & {
  remember?: boolean;
};

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      > span {
        position: relative;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `
}));

export default function Login() {
  const { styles } = useStyle();
  const t = useTranslations();
  // const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(watchAuthLoading);
  // const searchParams = useSearchParams();

  const onFinish = (values: LoginFormValues) => {
    dispatch(loginUser(values));
    // const redirectPath = searchParams.get('redirect');
    // if (redirectPath) {
    //   router.push(redirectPath);
    // } else {
    //   router.push(PageURLs.ofIndex());
    // }
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
          <ConfigProvider
            button={{
              className: styles.linearGradientButton
            }}
          >
            <Button
              loading={loading}
              size='large'
              type='primary'
              htmlType='submit'
              block
            >
              {t('login')}
            </Button>
          </ConfigProvider>
        </Form.Item>
      </Form>
      <Text>
        {t('registerPromptStart')}{' '}
        <Link href={PageURLs.ofRegister()}>{t('registerPromptLink')}</Link>
      </Text>
    </AuthLayout>
  );
}

const formLabelStyles = css`
  font-weight: 500;
  font-size: 1.6rem;
`;
