/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Col, Row, Collapse, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useCallback, useEffect } from 'react';
import {
  getCountSentiment,
  watchCountSentiment
} from '@/redux/slices/sentiment.slice';
import dayjs from 'dayjs';
import { CountCard } from './count-card';
import { useTranslations } from 'next-intl';

const { Title } = Typography;

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
    const now = dayjs();

    const from =
      fromDate ??
      (toDate
        ? dayjs(toDate).subtract(7, 'day').format('YYYY-MM-DD')
        : now.subtract(7, 'day').format('YYYY-MM-DD'));
    const to =
      toDate ??
      (fromDate
        ? dayjs(fromDate).add(7, 'day').format('YYYY-MM-DD')
        : now.format('YYYY-MM-DD'));

    dispatch(
      getCountSentiment({ symbol, query: { fromDate: from, toDate: to } })
    );
  }, [dispatch, symbol, fromDate, toDate]);

  useEffect(() => {
    fetchCountSentiment();
  }, [fetchCountSentiment]);

  return (
    <Collapse defaultActiveKey={['1']} expandIconPosition='right'>
      <Collapse.Panel
        header={
          <Title css={titleStyles} level={4}>
            {t('countSentiment')}
          </Title>
        }
        key='1'
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Row gutter={[16, 16]}>
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
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={[16, 16]}>
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
            </Row>
          </Col>
        </Row>
      </Collapse.Panel>
    </Collapse>
  );
};

const titleStyles = css`
  margin-bottom: 0 !important;
`;
