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
  flex: 0 0 auto;
  gap: ${compact ? '0' : '0.8rem'};
  width: ${compact ? '3.8rem' : 'auto'};
  min-width: ${compact ? '3.8rem' : '9.8rem'};
  max-width: ${compact ? '3.8rem' : 'none'};
  height: 3.8rem;
  min-height: 3.8rem;
  max-height: 3.8rem;
  inline-size: ${compact ? '3.8rem' : 'auto'};
  min-inline-size: ${compact ? '3.8rem' : '9.8rem'};
  max-inline-size: ${compact ? '3.8rem' : 'none'};
  block-size: 3.8rem;
  min-block-size: 3.8rem;
  max-block-size: 3.8rem;
  padding: ${compact ? '0 !important' : '0 1.1rem'};
  border-radius: ${compact ? '9999px !important' : '999px'};
  aspect-ratio: ${compact ? '1 / 1' : 'auto'};
  border: 1px solid var(--header-chip-border-color);
  background: var(--header-chip-background-color);
  color: var(--text-color);
  box-shadow: none;
  line-height: 1;
  overflow: hidden;

  :root[data-theme='dark'] & {
    box-shadow: none;
  }

  &:hover,
  &:focus {
    border-color: var(--primary-color) !important;
    color: var(--primary-color) !important;
    background: var(--header-chip-hover-background-color) !important;
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
