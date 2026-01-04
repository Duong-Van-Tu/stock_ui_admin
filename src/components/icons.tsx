/** @jsxImportSource @emotion/react */
import React from 'react';
import { css, SerializedStyles } from '@emotion/react';
import camelCase from 'lodash/camelCase';
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
import ListHighActivity from '@/assets/svg/high-activity.svg';
import Exit from '@/assets/svg/exit.svg';
import WatchlistSwingTrade from '@/assets/svg/watch-list-swing-trade.svg';
import LedgerEntry from '@/assets/svg/ledgerEntry.svg';
import Save from '@/assets/svg/save.svg';
import Edit from '@/assets/svg/edit.svg';
import Trash from '@/assets/svg/trash.svg';
import Back from '@/assets/svg/back.svg';
import Send from '@/assets/svg/send.svg';
import Volume from '@/assets/svg/volume.svg';
import TV from '@/assets/svg/tv.svg';
import Download from '@/assets/svg/download.svg';
import Upload from '@/assets/svg/upload.svg';
import Menu from '@/assets/svg/menu.svg';
import Clock from '@/assets/svg/clock.svg';
import Deposit from '@/assets/svg/deposit.svg';
import Withdraw from '@/assets/svg/withdraw.svg';
import AIStar from '@/assets/svg/ai-star.svg';
import Realtime from '@/assets/svg/realtime.svg';
import Entry from '@/assets/svg/entry.svg';
import History from '@/assets/svg/history.svg';
import Buy from '@/assets/svg/buy.svg';
import Sell from '@/assets/svg/sell.svg';
import Hold from '@/assets/svg/hold.svg';
import New from '@/assets/svg/new.svg';
import DotsVertical from '@/assets/svg/dots-vertical.svg';
import OptionsChanges from '@/assets/svg/options-changes.svg';
import AlertFilter from '@/assets/svg/alert-filter.svg';
import Fire from '@/assets/svg/fire.svg';
import OptionChainCall from '@/assets/svg/option-chain-call.svg';
import OptionChainPut from '@/assets/svg/option-chain-put.svg';
import Right from '@/assets/svg/right.svg';
import Left from '@/assets/svg/left.svg';
import ArrowDown from '@/assets/svg/arrow-down.svg';
import ColumnSetting from '@/assets/svg/column-setting.svg';
import FinnhubLseg from '@/assets/svg/finhub–lseg-news.svg';
import InsightScore from '@/assets/svg/insight-score.svg';
import Forecast from '@/assets/svg/est-forecast.svg';
import Add from '@/assets/svg/add.svg';

type IconProps = {
  width?: number | string;
  height?: number | string;
  fill?: string;
  icon: string;
  customStyles?: SerializedStyles;
  onClick?: () => void;
};

const svgList = {
  Logo,
  ExpandLeft,
  ExpandRight,
  Home,
  StockRanking,
  Calendar,
  Bell,
  Language,
  User,
  Logout,
  UserProfile,
  ExportExcel,
  AlertLogs,
  Refresh,
  Earnings,
  News,
  Recent,
  ArrowRight,
  AISentiment,
  Notes,
  ListHighActivity,
  Exit,
  WatchlistSwingTrade,
  LedgerEntry,
  Save,
  Edit,
  Trash,
  Back,
  Send,
  Volume,
  TV,
  Download,
  Upload,
  Menu,
  Clock,
  Deposit,
  Withdraw,
  AIStar,
  Realtime,
  Entry,
  History,
  Buy,
  Sell,
  Hold,
  New,
  DotsVertical,
  OptionsChanges,
  AlertFilter,
  Fire,
  OptionChainCall,
  OptionChainPut,
  Right,
  Left,
  ArrowDown,
  ColumnSetting,
  FinnhubLseg,
  InsightScore,
  Forecast,
  Add
};

const iconMap: Record<string, React.ComponentType<any>> = Object.entries(
  svgList
).reduce((acc, [name, component]) => {
  acc[camelCase(name)] = component;
  return acc;
}, {} as Record<string, React.ComponentType<any>>);

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
