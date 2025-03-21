/** @jsxImportSource @emotion/react */
import React from 'react';
import { css, SerializedStyles } from '@emotion/react';
import Logo from '@/assets/svgs/logo.svg';
import ExpandLeft from '@/assets/svgs/expand-left.svg';
import ExpandRight from '@/assets/svgs/expand-right.svg';
import Home from '@/assets/svgs/home.svg';
import StockRanking from '@/assets/svgs/stock-ranking.svg';

type IconProps = {
  width?: number | string;
  height?: number | string;
  fill?: string;
  type: string;
  customStyles?: SerializedStyles;
};

const iconMap: Record<string, React.ComponentType<any>> = {
  logo: Logo,
  expandLeft: ExpandLeft,
  expandRight: ExpandRight,
  home: Home,
  stockRanking: StockRanking
};

export const Icon = ({
  type,
  width,
  height,
  fill,
  customStyles
}: IconProps) => {
  const SelectedIcon = iconMap[type];

  if (!SelectedIcon) return null;

  return (
    <SelectedIcon
      width={width}
      height={height}
      css={[fill ? iconStyles(fill) : undefined, customStyles]}
    />
  );
};

const iconStyles = (fill: string) => css`
  path {
    fill: ${fill};
  }
`;
