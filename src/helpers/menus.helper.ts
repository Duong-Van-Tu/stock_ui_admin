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
): MenuItemStructure[] => [
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
    label: t('earnings'),
    key: 'earnings',
    iconType: 'earnings',
    link: PageURLs.ofEarings()
  },
  {
    label: t('AISentiment'),
    key: 'AI-sentiment',
    iconType: 'AISentiment',
    link: PageURLs.ofAISentiment()
  },
  {
    label: t('listHighActivity'),
    key: 'high-activity',
    iconType: 'listHighActivity',
    link: PageURLs.ofHighActivity()
  },
  {
    label: t('watchlistIn50Days'),
    key: 'watchlist-50-days',
    iconType: 'watchlist50Days',
    link: PageURLs.ofWatchListIn50days()
  },
  {
    label: t('LedgerEntry'),
    key: 'ledger-entry',
    iconType: 'ledgerEntry',
    link: PageURLs.ofLedgerEntry()
  }
];
