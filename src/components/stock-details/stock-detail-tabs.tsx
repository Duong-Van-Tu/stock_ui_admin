/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Card, Tabs, TabsProps } from 'antd';
import { StockDetailTabKey } from '@/constants/tabs.constant';
import FundamentalCharts from '../charts/fundamental-charts';
import SentimentCharts from '../charts/sentiment-charts';
import EarningsCharts from '../charts/earnings-charts';
import { NewDetails } from '../news-details';
import { useTranslations } from 'next-intl';

type StockDetailTabsProps = {
  symbol: string;
};

export const StockDetailTabs = ({ symbol }: StockDetailTabsProps) => {
  const t = useTranslations();
  const handleChangeTab = (key: string) => {
    console.log(key);
  };

  const items: TabsProps['items'] = [
    {
      key: StockDetailTabKey.Fundamental,
      label: <span css={tabLabelStyles}>Fundamental</span>,
      children: <FundamentalCharts symbol={symbol} />
    },
    {
      key: StockDetailTabKey.Earnings,
      label: <span css={tabLabelStyles}>Earnings</span>,
      children: <EarningsCharts symbol={symbol} />
    },
    {
      key: StockDetailTabKey.Sentiment,
      label: <span css={tabLabelStyles}>Sentiment</span>,
      children: (
        <div css={sentimentContainerStyles}>
          <SentimentCharts symbol={symbol} />
          <Card title={<span css={titleStyles}>{t('newsDetail')}</span>}>
            <NewDetails symbol={symbol} />
          </Card>
        </div>
      )
    }
  ];

  return <Tabs defaultActiveKey='1' items={items} onChange={handleChangeTab} />;
};

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
