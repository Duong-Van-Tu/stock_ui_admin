'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useEffect } from 'react';
import { Form, Input, Button, ConfigProvider } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import AuthLayout from '@/layout/auth.layout';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loginUser, watchAuthLoading } from '@/redux/slices/auth.slice';
import { createStyles } from 'antd-style';

type LoginFormValues = LoginUserParams;

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      height: 5.2rem;
      border: none;
      border-radius: 999px;
      background: linear-gradient(135deg, #0f7bff 0%, #20c3f2 100%);
      box-shadow: 0 1.8rem 3.6rem rgba(8, 127, 244, 0.24);
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        filter 0.2s ease;

      > span {
        position: relative;
        font-size: 1.5rem;
        font-weight: 700;
      }

      &::before {
        content: '';
        background: linear-gradient(135deg, #43d4ff, #0d6efd);
        position: absolute;
        inset: -1px;
        opacity: 0;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover,
      &:focus {
        box-shadow: 0 2.2rem 4rem rgba(8, 127, 244, 0.3);
        filter: saturate(1.06);
        transform: translateY(-1px);
      }

      &:hover::before {
        opacity: 0.18;
      }
    }
  `
}));

export default function Login() {
  const { styles } = useStyle();
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(watchAuthLoading);

  const onFinish = (values: LoginFormValues) => {
    dispatch(loginUser(values));
  };

  useEffect(() => {
    document.title = t('login');
  }, [t]);

  return (
    <AuthLayout description={t('loginIntro')} mode='login'>
      <Form
        css={formStyles}
        name='login-form'
        onFinish={onFinish}
        layout='vertical'
      >
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
    </AuthLayout>
  );
}

const formLabelStyles = css`
  font-weight: 600;
  font-size: 1.4rem;
  color: var(--text-primary-strong-color);
`;

const formStyles = css`
  .ant-form-item {
    position: relative;
    margin-bottom: 2.2rem;
  }

  .ant-form-item-control {
    position: static;
  }

  .ant-input-outlined,
  .ant-input-affix-wrapper {
    min-height: 5rem;
    padding: 0 1.4rem;
    border-radius: 1.6rem;
    border: 1px solid var(--border-light-color) !important;
    background: var(--surface-subtle-color) !important;
    box-shadow: none !important;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease;
  }

  .ant-input-affix-wrapper .ant-input {
    min-height: auto;
    padding: 0;
    background: transparent;
  }

  .ant-input,
  .ant-input-affix-wrapper input {
    color: var(--text-primary-strong-color) !important;
  }

  .ant-input::placeholder,
  .ant-input-affix-wrapper input::placeholder {
    color: var(--text-tertiary-color) !important;
  }

  .ant-input-prefix {
    margin-right: 1rem;
    color: var(--text-tertiary-color);
    font-size: 1.6rem;
  }

  .ant-input-password-icon.anticon {
    color: var(--text-tertiary-color);
  }

  .ant-form-item-additional {
    position: absolute;
    right: 0;
    left: 0;
    top: 100%;
    min-height: 2.2rem;
    pointer-events: none;
  }

  .ant-form-item-explain-error {
    margin-top: 0;
    font-size: 1.4rem;
    line-height: 1.5;
  }

  .ant-form-item:last-of-type {
    margin-top: 3.2rem;
    margin-bottom: 0;
  }

  .ant-input-outlined:hover,
  .ant-input-affix-wrapper:hover,
  .ant-input-outlined:focus,
  .ant-input-outlined.ant-input-focused,
  .ant-input-affix-wrapper-focused,
  .ant-input-affix-wrapper:focus {
    border-color: rgba(8, 127, 244, 0.5) !important;
    background: var(--surface-base-color) !important;
    box-shadow: 0 0 0 0.4rem rgba(8, 127, 244, 0.12) !important;
  }

  @media (max-width: 767px) {
    .ant-form-item {
      margin-bottom: 2.2rem;
    }
  }
`;
