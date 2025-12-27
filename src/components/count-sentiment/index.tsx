/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useEffect, useMemo } from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getNewsScores, watchNewsScores } from '@/redux/slices/sentiment.slice';
import { CountCard } from './count-card';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';

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
  const newsScores = useAppSelector(watchNewsScores);

  const dayType = useMemo(() => {
    if (!fromDate || !toDate) return undefined;

    const diff = dayjs(toDate).diff(dayjs(fromDate), 'day');

    if (diff <= 1) return 1;
    if (diff <= 3) return 3;
    return 7;
  }, [fromDate, toDate]);

  useEffect(() => {
    dispatch(
      getNewsScores({
        symbol,
        fromDate,
        toDate,
        typeDay: dayType,
        page: 1,
        limit: 10
      })
    );
  }, [dispatch, symbol, fromDate, toDate, dayType]);

  const score = useMemo(
    () => newsScores?.find((item) => item.symbol === symbol),
    [newsScores, symbol]
  );

  const collapseItems = [
    {
      key: '1',
      label: <h5 css={titleStyles}>{t('countSentiment')}</h5>,
      children: (
        <div css={cardRowStyles}>
          <div css={cardRowContainerStyles}>
            <CountCard
              title={t('positiveTitle')}
              rows={[
                { label: 'Finnhub', value: score?.finnhubPositiveCount },
                { label: 'LSEG', value: score?.lsegPositiveCount }
              ]}
              isPositive
            />

            <CountCard
              title={t('negativeTitle')}
              rows={[
                { label: 'Finnhub', value: score?.finnhubNegativeCount },
                { label: 'LSEG', value: score?.lsegNegativeCount }
              ]}
              isNegative
            />

            <CountCard
              title='LSEG Good BK'
              value={score?.lsegGoodBkCount}
              isPositive
            />

            <CountCard
              title='LSEG Bad BK'
              value={score?.lsegBadBkCount}
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
    flex: 1 1 18rem;
  }

  @media (max-width: 406px) {
    & > * {
      flex: 1 1 14rem;
    }
  }
`;

const titleStyles = css`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0;
`;
