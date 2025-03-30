'use client';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageURLs } from '@/utils/navigate';
import AuthLayout from '@/layout/auth.layout';
import { useAppDispatch } from '@/redux/hooks';
import { registerAndLogin } from '@/redux/slices/auth.slice';
import { regex } from '@/utils/regex';
import Link from 'next/link';

const { Text } = Typography;

type LoginFormValues = RegisterUserParams & {
  confirmPassword: string;
  remember?: boolean;
};

export default function Register() {
  const t = useTranslations();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const onFinish = (values: LoginFormValues) => {
    dispatch(registerAndLogin(values));
    router.push(PageURLs.ofIndex());
  };

  return (
    <AuthLayout title={t('register')}>
      <Form
        css={formStyles}
        name='register-form'
        onFinish={onFinish}
        layout='vertical'
      >
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
              pattern: regex.username,
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
            { pattern: regex.password, message: t('invalidPassword') }
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
        <Link href={PageURLs.ofLogin()}>{t('backToLogin')}</Link>
      </Text>
    </AuthLayout>
  );
}

const formLabelStyles = css`
  font-weight: 500;
  font-size: 1.6rem;
`;

const formStyles = css`
  .ant-form-item {
    margin-bottom: 1.4rem;
  }
`;
