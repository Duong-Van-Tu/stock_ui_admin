/** @jsxImportSource @emotion/react */
import React from 'react';
import { css, SerializedStyles } from '@emotion/react';
import Logo from '@/assets/svg/logo.svg';
import ExpandLeft from '@/assets/svg/expand-left.svg';
import ExpandRight from '@/assets/svg/expand-right.svg';
import Home from '@/assets/svg/home.svg';
import StockRanking from '@/assets/svg/stock-ranking.svg';
import Calendar from '@/assets/svg/calendar.svg';
import Bell from '@/assets/svg/bell.svg';
import Language from '@/assets/svg/language.svg';
import User from '@/assets/svg/user.svg';
import Logout from '@/assets/svg/logout.svg';
import UserProfile from '@/assets/svg/user-profile.svg';
import ExportExcel from '@/assets/svg/export-excel.svg';
import AlertLogs from '@/assets/svg/alert-logs.svg';
import Refresh from '@/assets/svg/refresh.svg';
import Earnings from '@/assets/svg/earnings.svg';
import News from '@/assets/svg/news.svg';
import Recent from '@/assets/svg/recent.svg';
import ArrowRight from '@/assets/svg/arrow-right.svg';
import AISentiment from '@/assets/svg/ai-sentiment.svg';
import Notes from '@/assets/svg/notes.svg';

type IconProps = {
  width?: number | string;
  height?: number | string;
  fill?: string;
  icon: string;
  customStyles?: SerializedStyles;
  onClick?: () => void;
};

const iconMap: Record<string, React.ComponentType<any>> = {
  logo: Logo,
  expandLeft: ExpandLeft,
  expandRight: ExpandRight,
  home: Home,
  stockRanking: StockRanking,
  calendar: Calendar,
  bell: Bell,
  language: Language,
  user: User,
  logout: Logout,
  userProfile: UserProfile,
  exportExcel: ExportExcel,
  alertLogs: AlertLogs,
  refresh: Refresh,
  earnings: Earnings,
  news: News,
  recent: Recent,
  arrowRight: ArrowRight,
  AISentiment: AISentiment,
  notes: Notes
};

export const Icon = ({
  icon,
  width,
  height,
  fill,
  customStyles,
  onClick
}: IconProps) => {
  const SelectedIcon = iconMap[icon];

  if (!SelectedIcon) return null;

  return (
    <SelectedIcon
      width={width}
      height={height}
      css={[fill ? iconStyles(fill) : undefined, customStyles]}
      onClick={onClick}
    />
  );
};

const iconStyles = (fill: string) => css`
  path {
    fill: ${fill};
  }
`;
