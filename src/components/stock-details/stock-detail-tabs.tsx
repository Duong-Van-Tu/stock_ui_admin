'use client';
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Card, Tabs, TabsProps } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { StockDetailTabKey } from '@/constants/tabs.constant';
import FundamentalCharts from '../charts/fundamental-charts';
import SentimentCharts from '../charts/sentiment-charts';
import EarningsCharts from '../charts/earnings-charts';
import { NewDetails } from '../news-details';
import { useTranslations } from 'next-intl';
import { SearchSignalTable } from '../tables/search-signals.table';

type StockDetailTabsProps = {
  symbol: string;
  onTabChange?: () => void;
};

export const StockDetailTabs = ({
  symbol,
  onTabChange
}: StockDetailTabsProps) => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab') || StockDetailTabKey.Signal;

  const handleChangeTab = (key: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('tab', key);
    router.replace(`?${current.toString()}`);
    onTabChange?.();
  };

  const items: TabsProps['items'] = useMemo(
    () => [
      {
        key: StockDetailTabKey.Signal,
        label: <span css={tabLabelStyles}>{t('signals')}</span>,
        children: <SearchSignalTable symbol={symbol} showTitle={false} />
      },
      {
        key: StockDetailTabKey.Fundamental,
        label: <span css={tabLabelStyles}>{t('fundamental')}</span>,
        children: <FundamentalCharts symbol={symbol} />
      },
      {
        key: StockDetailTabKey.Earnings,
        label: <span css={tabLabelStyles}>{t('earnings')}</span>,
        children: <EarningsCharts symbol={symbol} />
      },
      {
        key: StockDetailTabKey.Sentiment,
        label: <span css={tabLabelStyles}>{t('sentiment')}</span>,
        children: (
          <div css={sentimentContainerStyles}>
            <SentimentCharts symbol={symbol} />
            <Card title={<span css={titleStyles}>{t('newsDetail')}</span>}>
              <NewDetails symbol={symbol} />
            </Card>
          </div>
        )
      }
    ],
    [symbol, t]
  );

  return (
    <Tabs
      css={rootStyles}
      activeKey={tabParam}
      items={items}
      onChange={handleChangeTab}
    />
  );
};

const rootStyles = css`
  .ant-tabs-nav {
    position: sticky;
    z-index: 2;
    top: 6rem;
    background: var(--white-color);
  }
`;
const tabLabelStyles = css`
  text-transform: uppercase;
  font-weight: 500;
`;

const sentimentContainerStyles = css`
  display: flex;
  flex-direction: column;
  gap: 2.6rem;
`;

const titleStyles = css`
  font-size: 2rem;
`;
