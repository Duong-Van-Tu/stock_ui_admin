/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import dayjs from 'dayjs';

import { Select } from 'antd';
import { useTranslations } from 'next-intl';
import { SymbolEarningsDetail } from './symbol-earnings-detail';
import { NewsSentiment } from '@/components/news-sentiment';

type EarningsDetailsProps = { symbol: string };

export const EarningsDetails = ({ symbol }: EarningsDetailsProps) => {
  const t = useTranslations();
  const [range, setRange] = useState(7);

  // Earnings: from today to N days in the future
  const earningsFromDate = dayjs().format('YYYY-MM-DD');
  const earningsToDate = dayjs().add(range, 'day').format('YYYY-MM-DD');

  // News: from N days ago to today
  const newsFromDate = dayjs()
    .subtract(range - 1, 'day')
    .format('YYYY-MM-DD');
  const newsToDate = dayjs().format('YYYY-MM-DD');

  return (
    <div css={rootStyles}>
      <div css={selectDateStyles}>
        <Select
          css={selectStyles}
          value={range}
          onChange={(value) => setRange(Number(value))}
          options={[
            { value: 1, label: t('1Day') },
            { value: 2, label: t('2Days') },
            { value: 3, label: t('3Days') },
            { value: 4, label: t('4Days') },
            { value: 5, label: t('5Days') },
            { value: 6, label: t('6Days') },
            { value: 7, label: t('1Week') },
            { value: 14, label: t('2Weeks') },
            { value: 21, label: '3 Weeks' }
          ]}
        />
      </div>

      <SymbolEarningsDetail
        fromDate={earningsFromDate}
        toDate={earningsToDate}
        symbol={symbol}
      />

      <NewsSentiment
        fromDate={newsFromDate}
        toDate={newsToDate}
        symbol={symbol}
      />
    </div>
  );
};

const rootStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

const selectDateStyles = css`
  display: flex;
  justify-content: flex-end;
  gap: 1.6rem;
`;

const selectStyles = css`
  width: 10rem;
  height: 2.8rem;
  .ant-select-selector {
    background: var(--blue-100) !important;
    .ant-select-selection-item {
      font-weight: 500;
    }
  }
`;
