/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Tabs, TabsProps } from 'antd';
import { StockDetailTabKey } from '@/constants/tabs.constant';
import { UnderDevelopment } from '../under-development';
import FundamentalCharts from '../charts/fundamental-charts';
import SentimentCharts from '../charts/sentiment-charts';

type StockDetailTabsProps = {
  symbol: string;
};

export const StockDetailTabs = ({ symbol }: StockDetailTabsProps) => {
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
      children: <UnderDevelopment />
    },
    {
      key: StockDetailTabKey.Sentiment,
      label: <span css={tabLabelStyles}>Sentiment</span>,
      children: <SentimentCharts symbol={symbol} />
    }
  ];

  return <Tabs defaultActiveKey='1' items={items} onChange={handleChangeTab} />;
};

const tabLabelStyles = css`
  text-transform: uppercase;
  font-weight: 500;
`;
