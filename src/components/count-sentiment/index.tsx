/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useEffect } from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getCountSentiment,
  watchCountSentiment
} from '@/redux/slices/sentiment.slice';
import { CountCard } from './count-card';
import { useTranslations } from 'next-intl';
import { useWindowSize } from '@/hooks/window-size.hook';

type CountSentimentProps = {
  symbol: string;
  fromDate?: string;
  toDate?: string;
};

export const CountSentiment = ({
  symbol,
  fromDate,
  toDate
}: CountSentimentProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const countSentiment = useAppSelector(watchCountSentiment);

  const fetchCountSentiment = useCallback(() => {
    dispatch(getCountSentiment({ symbol, query: { fromDate, toDate } }));
  }, [dispatch, symbol, fromDate, toDate]);

  useEffect(() => {
    fetchCountSentiment();
  }, [fetchCountSentiment]);

  const collapseItems = [
    {
      key: '1',
      label: <h5 css={titleStyles}>{t('countSentiment')}</h5>,
      children: (
        <div css={cardRowStyles}>
          <div css={cardRowContainerStyles}>
            <CountCard
              title={t('positiveTitle')}
              value={countSentiment.countPositive}
              isPositive
            />
            <CountCard
              title={t('veryPositiveTitle')}
              value={countSentiment.countVeryPositive}
              isPositive
            />
            <CountCard
              title={t('negativeTitle')}
              value={countSentiment.countNegative}
              isNegative
            />
            <CountCard
              title={t('veryNegativeTitle')}
              value={countSentiment.countVeryNegative}
              isNegative
            />
          </div>
        </div>
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
`;

const cardRowStyles = css`
  display: flex;
  justify-content: center;
`;

const cardRowContainerStyles = css`
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem;

  & > * {
    flex: 1 1 16rem;
  }

  @media (max-width: 406px) {
    & > * {
      flex: 1 1 12rem;
    }
  }

  @media (min-width: 576px) {
    & > * {
      flex: 1 1 19rem;
    }
  }
`;

const titleStyles = css`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0;
`;
