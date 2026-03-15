'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Button, Tooltip } from 'antd';
import { BulbFilled, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useThemeMode } from '@/providers/theme.provider';

type ThemeToggleProps = {
  compact?: boolean;
};

export default function ThemeToggle({
  compact = false
}: ThemeToggleProps) {
  const { themeMode, isDarkMode, toggleTheme } = useThemeMode();

  return (
    <Tooltip
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Button
        type='default'
        shape={compact ? 'circle' : 'default'}
        icon={
          isDarkMode ? (
            <SunOutlined css={toggleIconStyles} />
          ) : (
            <MoonOutlined css={toggleIconStyles} />
          )
        }
        onClick={toggleTheme}
        css={toggleButtonStyles(compact)}
      >
        {!compact && (
          <span css={toggleLabelStyles}>
            {themeMode === 'dark' ? 'Dark' : 'Light'}
          </span>
        )}
        {!compact && <BulbFilled css={accentIconStyles(isDarkMode)} />}
      </Button>
    </Tooltip>
  );
}

const toggleButtonStyles = (compact: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${compact ? '0' : '0.8rem'};
  min-width: ${compact ? '3.4rem' : '9.6rem'};
  height: 3.4rem;
  padding: ${compact ? '0' : '0 1.1rem'};
  border-radius: ${compact ? '50%' : '999px'};
  border-color: var(--border-color);
  background: var(--surface-elevated-color);
  color: var(--text-color);
  box-shadow: 0 0.6rem 1.6rem var(--box-shadow-color);

  &:hover,
  &:focus {
    border-color: var(--primary-color) !important;
    color: var(--primary-color) !important;
    background: var(--surface-elevated-color) !important;
  }
`;

const toggleIconStyles = css`
  font-size: 1.5rem;
`;

const toggleLabelStyles = css`
  font-size: 1.3rem;
  font-weight: 600;
  line-height: 1;
`;

const accentIconStyles = (isDarkMode: boolean) => css`
  color: ${isDarkMode ? 'var(--yellow-color)' : 'var(--primary-color)'};
  font-size: 1.2rem;
`;
