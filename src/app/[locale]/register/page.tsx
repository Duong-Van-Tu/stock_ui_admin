'use client';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageURLs } from '@/utils/navigate';
import AuthLayout from '@/layout/auth.layout';

const { Text } = Typography;

export default function Register() {
  const t = useTranslations();
  const router = useRouter();

  const onFinish = (values: any) => {
    router.push(PageURLs.ofIndex());
  };

  return (
    <AuthLayout title={t('register')}>
      <Form name='register-form' onFinish={onFinish} layout='vertical'>
        <Form.Item
          label={<span css={formLabelStyles}>{t('fullName')}</span>}
          name='fullname'
          rules={[
            { required: true, message: t('pleaseEnterFullName') },
            { min: 3, message: t('fullNameMinLength') }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            size='large'
            placeholder={t('enterFullName')}
          />
        </Form.Item>

        <Form.Item
          label={<span css={formLabelStyles}>{t('username')}</span>}
          name='username'
          rules={[
            { required: true, message: t('pleaseEnterUsername') },
            { min: 3, message: t('usernameMinLength') },
            {
              pattern: /^[a-zA-Z0-9_]+$/,
              message: t('usernamePattern')
            }
          ]}
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
          rules={[
            { required: true, message: t('pleaseEnterPassword') },
            { min: 6, message: t('passwordMinLength') }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size='large'
            placeholder={t('enterPassword')}
          />
        </Form.Item>

        <Form.Item
          label={<span css={formLabelStyles}>{t('confirmPassword')}</span>}
          name='confirmPassword'
          dependencies={['password']}
          rules={[
            { required: true, message: t('pleaseConfirmPassword') },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t('passwordsDoNotMatch')));
              }
            })
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            size='large'
            placeholder={t('reenterPassword')}
          />
        </Form.Item>

        <Form.Item name='remember' valuePropName='checked'>
          <Checkbox>{t('rememberMe')}</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button size='large' type='primary' htmlType='submit' block>
            {t('register')}
          </Button>
        </Form.Item>
      </Form>

      <Text>
        <a onClick={() => router.push(PageURLs.ofLogin())}>
          {t('backToLogin')}
        </a>
      </Text>
    </AuthLayout>
  );
}

const formLabelStyles = css`
  font-weight: 500;
  font-size: 1.6rem;
`;
