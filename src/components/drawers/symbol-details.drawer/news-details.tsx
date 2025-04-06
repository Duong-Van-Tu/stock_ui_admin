/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useState } from 'react';
import dayjs from 'dayjs';

import { CountSentiment } from '@/components/count-sentiment';
import { Select } from 'antd';
import { Icon } from '@/components/icons';
import { useTranslations } from 'next-intl';

type NewDetailsProps = { symbol: string };

export const NewDetails = ({ symbol }: NewDetailsProps) => {
  const t = useTranslations();
  const [range, setRange] = useState(7);
  const toDate = dayjs().format('YYYY-MM-DD');
  const fromDate = dayjs().subtract(range, 'day').format('YYYY-MM-DD');

  return (
    <div css={rootStyles}>
      <div css={selectDateStyles}>
        <div css={rangeDateStyles}>
          <span>
            <strong>{t('fromLabel')}</strong>{' '}
            {dayjs(fromDate).format('MM-DD-YYYY')}
          </span>
          <Icon icon='arrowRight' width={20} height={20} />
          <span>
            <strong>{t('toLabel')}</strong> {dayjs(toDate).format('MM-DD-YYYY')}
          </span>
        </div>
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
            { value: 14, label: t('2Weeks') }
          ]}
        />
      </div>
      <CountSentiment fromDate={fromDate} toDate={toDate} symbol={symbol} />
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

const rangeDateStyles = css`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const selectStyles = css`
  width: 10rem;
  .ant-select-selector {
    background: var(--blue-100) !important;
    .ant-select-selection-item {
      font-weight: 500;
    }
  }
`;
