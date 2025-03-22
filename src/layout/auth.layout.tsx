'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Typography } from 'antd';
import { Icon } from '@/components/icons';
import { useWindowSize } from '@/hooks/useWindowSize';

const { Title } = Typography;

type AuthLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  const { isMobile } = useWindowSize();
  return (
    <div css={rootStyle}>
      <div css={containerStyles(isMobile)}>
        <div css={logoStyles}>
          <Icon icon='logo' width={60} height={60} />
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

const containerStyles = (isMobile: boolean) => css`
  min-width: ${isMobile ? '100%' : '45rem'};
  max-width: 45rem;
  padding: 2.6rem 2.4rem;
  box-shadow: ${isMobile ? 'none' : '0rem 0.4rem 1rem rgba(0, 0, 0, 0.1)'};
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
