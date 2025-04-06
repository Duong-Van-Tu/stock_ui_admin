/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';
import { CompanyNews } from './company-news';

type CompanyNewsProps = {
  symbol: string;
  fromDate?: string;
  toDate?: string;
};

export const NewsSentiment = ({
  symbol,
  fromDate,
  toDate
}: CompanyNewsProps) => {
  const t = useTranslations();

  const collapseItems = [
    {
      key: '1',
      label: <h5 css={titleStyles}>{t('companyNews')}</h5>,
      children: (
        <CompanyNews symbol={symbol} fromDate={fromDate} toDate={toDate} />
      )
    }
  ];

  return (
    <Collapse
      css={collapseStyles}
      defaultActiveKey={['1']}
      expandIconPosition='end'
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      items={collapseItems}
    />
  );
};

const collapseStyles = css`
  .ant-collapse-header {
    align-items: center !important;
  }
  .ant-collapse-content-box {
    padding: 0 !important;
  }
`;

const titleStyles = css`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0;
`;
