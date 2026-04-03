/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Button, Tooltip } from 'antd';
import type { ButtonProps } from 'antd';
import type { ReactNode } from 'react';
import { isMobile } from 'react-device-detect';
import { Icon } from './icons';

type BackButtonProps = {
  onClick: () => void;
  label?: ReactNode;
  tooltip?: ReactNode;
  size?: ButtonProps['size'];
  wrapperCss?: SerializedStyles;
  buttonCss?: SerializedStyles;
};

export function BackButton({
  onClick,
  label,
  tooltip,
  size,
  wrapperCss,
  buttonCss
}: BackButtonProps) {
  const button = (
    <Button
      css={[
        backButtonStyles,
        label ? labelledBackButtonStyles : undefined,
        buttonCss
      ]}
      shape={label ? undefined : 'circle'}
      type='default'
      size={size}
      icon={
        <Icon icon='back' width={18} height={18} fill='var(--text-color)' />
      }
      onClick={onClick}
    >
      {label}
    </Button>
  );

  const content =
    tooltip && !isMobile ? <Tooltip title={tooltip}>{button}</Tooltip> : button;

  return wrapperCss ? <div css={wrapperCss}>{content}</div> : content;
}

const backButtonStyles = css`
  background: var(--surface-elevated-color);
  border-color: var(--border-color);
  color: var(--text-color);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);

  &:hover,
  &:focus {
    background: var(--surface-subtle-color) !important;
    border-color: var(--primary-color) !important;
    color: var(--text-color) !important;
  }
`;

const labelledBackButtonStyles = css`
  border-radius: 999px;
  padding-inline: 1.6rem;
  font-weight: 500;
`;
