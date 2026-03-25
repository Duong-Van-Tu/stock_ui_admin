/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactNode } from 'react';

type PositiveNegativeTextProps = {
  isPositive?: boolean;
  isNegative?: boolean;
  size?: string;
  contrastInDark?: boolean;
  children: ReactNode;
};

export const PositiveNegativeText = ({
  isPositive,
  isNegative,
  size = '1.4rem',
  contrastInDark = false,
  children
}: PositiveNegativeTextProps) => {
  return (
    <span css={textStyle(isPositive, isNegative, size, contrastInDark)}>
      {children}
    </span>
  );
};

const textStyle = (
  isPositive?: boolean,
  isNegative?: boolean,
  size?: string,
  contrastInDark?: boolean
) => {
  const color = isPositive
    ? 'var(--positive-color)'
    : isNegative
    ? 'var(--negative-color)'
    : 'var(--yellow-color)';

  const darkColor =
    contrastInDark && isPositive
      ? '#4cd964'
      : contrastInDark && isNegative
      ? '#ff5c5c'
      : contrastInDark
      ? '#ffd54a'
      : color;

  return css`
    color: ${color};
    font-size: ${size};
    font-weight: 500;

    :root[data-theme='dark'] & {
      color: ${darkColor};
    }
  `;
};
