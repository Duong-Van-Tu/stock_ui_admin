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
      label: t('alertLogsFilter'),
      key: 'alert-filter',
      iconType: 'alertFilter',
      link: PageURLs.ofAlertLogsFilter()
    },
    {
      label: t('news'),
      key: 'news',
      iconType: 'news',
      link: PageURLs.ofNews()
    },
    {
      label: t('finnhubLsegNews'),
      key: 'finnhub-lseg',
      iconType: 'finnhubLseg',
      link: PageURLs.ofFinnhubLsegNews()
    },
    {
      label: t('earnings'),
      key: 'earnings',
      iconType: 'earnings',
      link: PageURLs.ofEarings()
    },
    // ...(!isMobile
    //   ? [
    //       {
    //         label: t('listHighActivity'),
    //         key: 'high-activity',
    //         iconType: 'listHighActivity',
    //         link: PageURLs.ofHighActivity()
    //       }
    //     ]
    //   : []),
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
