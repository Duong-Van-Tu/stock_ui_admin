'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Typography } from 'antd';
import { Icon } from '@/components/icons';
import { useWindowSize } from '@/hooks/window-size.hook';
import ThemeToggle from '@/components/theme-toggle';
import { useThemeMode } from '@/providers/theme.provider';

const { Title } = Typography;

type AuthLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  const { isMobile } = useWindowSize();
  const { isDarkMode } = useThemeMode();
  return (
    <div css={rootStyle(isDarkMode)}>
      <div css={containerStyles(isMobile, isDarkMode)}>
        <div css={toggleWrapStyles(isDarkMode)}>
          <ThemeToggle compact />
        </div>
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

const rootStyle = (isDarkMode: boolean) => css`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  ${isDarkMode
    ? `
      background: var(--app-background-color);
    `
    : ''}
`;

const containerStyles = (isMobile: boolean, isDarkMode: boolean) => css`
  position: relative;
  min-width: ${isMobile ? '100%' : '45rem'};
  max-width: 45rem;
  padding: 2.6rem 2.4rem;
  box-shadow: ${isMobile
    ? 'none'
    : isDarkMode
      ? '0rem 0.4rem 1rem var(--box-shadow-color)'
      : '0rem 0.4rem 1rem rgba(0, 0, 0, 0.1)'};
  border-radius: 0.8rem;
  background: ${isDarkMode ? 'var(--surface-elevated-color)' : 'var(--white-color)'};
`;

const toggleWrapStyles = (isDarkMode: boolean) => css`
  position: absolute;
  top: ${isDarkMode ? '1.4rem' : '0.8rem'};
  right: ${isDarkMode ? '1.4rem' : '0.8rem'};
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
