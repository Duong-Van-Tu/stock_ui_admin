/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactNode } from 'react';

type PositiveNegativeTextProps = {
  isPositive?: boolean;
  isNegative?: boolean;
  size?: string;
  children: ReactNode;
};

export const PositiveNegativeText = ({
  isPositive,
  isNegative,
  size = '1.4rem',
  children
}: PositiveNegativeTextProps) => {
  return <span css={textStyle(isPositive, isNegative, size)}>{children}</span>;
};

const textStyle = (
  isPositive?: boolean,
  isNegative?: boolean,
  size?: string
) => {
  const color = isPositive
    ? 'var(--positive-color)'
    : isNegative
    ? 'var(--negative-color)'
    : 'var(--yellow-color)';

  return css`
    color: ${color};
    font-size: ${size};
    font-weight: 500;
  `;
};
