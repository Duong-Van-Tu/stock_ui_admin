'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Typography } from 'antd';
import { Icon } from '@/components/icons';

const { Title } = Typography;

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div css={rootStyle}>
      <div css={containerStyles}>
        <div css={logoStyles}>
          <Icon type='logo' width={60} height={60} />
        </div>

        <Title level={3} css={titleStyles}>
          {title}
        </Title>
        <div css={contentStyles}>{children}</div>
      </div>
    </div>
  );
}

const rootStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;
const containerStyles = css`
  min-width: 40rem;
  max-width: 50rem;
  padding: 2.6rem 2.4rem;
  box-shadow: 0rem 0.4rem 1rem rgba(0, 0, 0, 0.1);
  border-radius: 0.8rem;
  background: var(--white-color);
`;

const logoStyles = css`
  text-align: center;
`;

const titleStyles = css`
  text-align: center;
  margin-top: 2.4rem;
`;

const contentStyles = css`
  margin-top: 2rem;
`;
