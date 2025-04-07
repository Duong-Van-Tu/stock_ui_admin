/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactNode } from 'react';

type PositiveNegativeTextProps = {
  isPositive?: boolean;
  isNegative?: boolean;
  children: ReactNode;
};

export const PositiveNegativeText = ({
  isPositive,
  isNegative,
  children
}: PositiveNegativeTextProps) => {
  return <span css={textStyle(isPositive, isNegative)}>{children}</span>;
};

const textStyle = (isPositive?: boolean, isNegative?: boolean) => {
  const color = isPositive
    ? 'var(--positive-color)'
    : isNegative
    ? 'var(--negative-color)'
    : 'var(--yellow-color)';

  return css`
    color: ${color};
    font-size: 1.4rem;
    font-weight: 500;
  `;
};
