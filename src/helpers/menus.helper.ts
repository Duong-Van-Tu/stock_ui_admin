import { Key, ReactNode } from 'react';
import { MenuProps } from 'antd';
import { PageURLs } from '@/utils/navigate';

export type LevelKeysProps = {
  key?: string;
  children?: LevelKeysProps[];
};

export type MenuItem = Required<MenuProps>['items'][number];
export function getItem(
  label: ReactNode,
  key: Key,
  icon?: ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label
  } as MenuItem;
}

export const getLevelKeys = (items1: LevelKeysProps[]) => {
  const key: Record<string, number> = {};
  const func = (items2: LevelKeysProps[], level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};

export const getMenuStructure = (
  t: (key: string) => string
): MenuItemStructure[] => {
  const menu: MenuItemStructure[] = [
    {
      label: t('home'),
      key: 'home',
      iconType: 'home',
      link: PageURLs.ofIndex()
    },
    {
      label: t('stockRanking'),
      key: 'stock-rankings',
      iconType: 'stockRanking',
      link: PageURLs.ofStockRanking()
    },
    {
      label: t('alertLogs'),
      key: 'alert-logs',
      iconType: 'alertLogs',
      link: PageURLs.ofAlertLogs()
    },
    {
      label: t('newsScores'),
      key: 'insight-score',
      iconType: 'insightScore',
      link: PageURLs.ofInsightScore()
    },
    {
      label: t('finnhubLsegNews'),
      key: 'finnhub-lseg',
      iconType: 'finnhubLseg',
      link: PageURLs.ofFinnhubLsegNews()
    },
    {
      label: t('breakingNewsAnalytics'),
      key: 'breaking-news-analytics',
      iconType: 'breakingNewsAnalytics',
      link: PageURLs.ofBreakingNewsAnalytics()
    },
    {
      label: t('lsegSelection'),
      key: 'lseg-selection',
      iconType: 'starMine',
      link: PageURLs.ofLsegSelection()
    },
    {
      label: t('marketPsychology'),
      key: 'market-psychology',
      iconType: 'marketPsychology',
      link: PageURLs.ofMarketPsychology()
    },
    {
      label: t('earnings'),
      key: 'earnings',
      iconType: 'earnings',
      link: PageURLs.ofEarings()
    },
    {
      label: t('earningsStrategy'),
      key: 'forecast',
      iconType: 'forecast',
      link: PageURLs.ofEstForecast()
    },
    {
      label: t('earningSelection'),
      key: 'earning-selection',
      iconType: 'earningSelection',
      link: PageURLs.ofEarningSelection()
    },
    {
      label: t('watchlistSwingTrade'),
      key: 'watchlist-swing-trade',
      iconType: 'watchlistSwingTrade',
      link: PageURLs.ofWatchListSwingTrade()
    },
    {
      label: t('ledgerEntry'),
      key: 'ledger-entry',
      iconType: 'ledgerEntry',
      link: PageURLs.ofLedgerEntry()
    },
    {
      label: t('optionChainCall'),
      key: 'option-chain-call',
      iconType: 'optionChainCall',
      link: PageURLs.ofOptionChainCall()
    },
    {
      label: t('optionChainPut'),
      key: 'option-chain-put',
      iconType: 'optionChainPut',
      link: PageURLs.ofOptionChainPut()
    }
  ];

  return menu.filter(Boolean);
};
