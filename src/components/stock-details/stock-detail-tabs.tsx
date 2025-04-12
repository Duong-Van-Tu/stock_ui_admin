/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Tabs, TabsProps } from 'antd';
import { StockDetailTabKey } from '@/constants/tabs.constant';
import FundamentalDetailChart from '../charts/fundamental-charts/fundamental-detail.chart';
import FundamentalScore from '../charts/fundamental-charts/fundamental-score.chart';
import { UnderDevelopment } from '../under-development';

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
      children: (
        <div css={fundamentalContentStyles}>
          <FundamentalDetailChart symbol={symbol} />{' '}
          <FundamentalScore symbol={symbol} />
        </div>
      )
    },
    {
      key: StockDetailTabKey.Earnings,
      label: <span css={tabLabelStyles}>Earnings</span>,
      children: <UnderDevelopment />
    },
    {
      key: StockDetailTabKey.Sentiment,
      label: <span css={tabLabelStyles}>Sentiment</span>,
      children: <UnderDevelopment />
    }
  ];

  return <Tabs defaultActiveKey='1' items={items} onChange={handleChangeTab} />;
};

const tabLabelStyles = css`
  text-transform: uppercase;
  font-weight: 500;
`;

const fundamentalContentStyles = css`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;
