/** @jsxImportSource @emotion/react */
import React from 'react';
import { css } from '@emotion/react';
import Logo from '@/assets/svgs/logo.svg';

type IconProps = {
  width?: number | string;
  height?: number | string;
  fill?: string;
  type: string;
};

const iconMap: Record<string, React.ComponentType<any>> = {
  logo: Logo
};

export const Icon = ({ type, width, height, fill }: IconProps) => {
  const SelectedIcon = iconMap[type];

  if (!SelectedIcon) return null;

  return (
    <SelectedIcon
      width={width}
      height={height}
      css={fill ? iconStyles(fill) : undefined}
    />
  );
};

const iconStyles = (fill: string) => css`
  path {
    fill: ${fill};
  }
`;
