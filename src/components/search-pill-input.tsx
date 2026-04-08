/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';

type SearchPillInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  width?: number | string;
  minWidth?: number | string;
  clearAriaLabel?: string;
};

const toCssSize = (value?: number | string) => {
  if (value == null) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

export function SearchPillInput({
  placeholder,
  value,
  onChange,
  onSearch,
  width = '32rem',
  minWidth,
  clearAriaLabel = 'Clear search'
}: SearchPillInputProps) {
  return (
    <div css={searchWrapperStyles(toCssSize(width), toCssSize(minWidth))}>
      <input
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch((e.target as HTMLInputElement).value);
          }
        }}
        css={searchInputStyles}
      />
      {!!value && (
        <button
          type='button'
          aria-label={clearAriaLabel}
          onClick={() => onChange('')}
          css={searchClearBtnStyles}
        >
          ×
        </button>
      )}
      <Button
        type='text'
        css={searchActionBtnStyles}
        icon={<SearchOutlined css={searchActionIconStyles} />}
        onClick={() => onSearch(value)}
      />
    </div>
  );
}

const searchWrapperStyles = (
  width: string | undefined,
  minWidth?: string
) => css`
  width: ${width ?? '32rem'};
  min-width: ${minWidth ?? 'unset'};
  max-width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  height: 4.4rem;
  padding: 0 0.6rem 0 1.6rem;
  background: var(--surface-elevated-color);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  box-shadow: none;
  overflow: hidden;

  :root[data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.14);
  }
`;

const searchInputStyles = css`
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-color);
  font-size: 1.45rem;
  font-weight: 500;
  padding: 0 6.8rem 0 0;

  &::placeholder {
    color: var(--text-tertiary-color);
  }
`;

const searchClearBtnStyles = css`
  position: absolute;
  top: 50%;
  right: 4.3rem;
  transform: translateY(-50%);
  width: 1.8rem;
  height: 1.8rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--text-tertiary-color);
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
`;

const searchActionBtnStyles = css`
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  width: 3.6rem;
  min-width: 3.6rem;
  height: 3.6rem !important;
  padding: 0;
  border: none !important;
  border-radius: 50% !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0d7dff 0%, #19c8ff 100%) !important;
  box-shadow: none;

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #1a88ff 0%, #28d0ff 100%) !important;
  }
`;

const searchActionIconStyles = css`
  color: var(--white-color);
  font-size: 1.7rem;
`;
