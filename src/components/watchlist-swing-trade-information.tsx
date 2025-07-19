/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useTranslations } from 'next-intl';
import { Row, Col, Button, Modal } from 'antd';
import { useWindowSize } from '@/hooks/window-size.hook';
import StockOverviewChart from './charts/stock-overview.chart';
import { TimeZone } from '@/constants/timezone.constant';
import dayjs from 'dayjs';
import { PositiveNegativeText } from './positive-negative-text';
import { Recommendation } from '@/constants/common.constant';
import { PriceWithChange } from './price-with-change';

type WatchlistSwingTradeInformationProps = {
  history: HistoryWatchlistSwingTrade;
};

export const WatchlistSwingTradeInformation = ({
  history
}: WatchlistSwingTradeInformationProps) => {
  const t = useTranslations();
  const { width } = useWindowSize();
  const [modal, contextHolder] = Modal.useModal();

  return (
    <>
      {contextHolder}
      <h3 css={styles.title}>{`${t('symbol')}: ${history.symbol}`}</h3>
      <div css={styles.chartOverviewStyles}>
        <StockOverviewChart symbol={history.symbol} />
      </div>
      <div css={styles.infoGroup}>
        <Row gutter={[32, 8]}>
          {[
            {
              label: t('createdAt'),
              value: history?.createdAt
                ? dayjs(history.createdAt)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            { label: t('period'), value: history.period || '--' },
            { label: t('aiRating'), value: history.aiRating || '--' },
            {
              label: t('aiRecommendation'),
              value: history?.aiRecommendation ? (
                <PositiveNegativeText
                  isPositive={history.aiRecommendation === Recommendation.BUY}
                  isNegative={history.aiRecommendation === Recommendation.SELL}
                >
                  <span>{history.aiRecommendation.toUpperCase()}</span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
            },
            {
              label: t('aiExplain'),
              value: history?.aiExplain ? (
                <Button
                  css={styles.AIExplainBtn}
                  type='link'
                  onClick={() =>
                    modal.confirm({
                      title: t('aiExplain'),
                      content: history.aiExplain,
                      cancelText: t('close')
                    })
                  }
                >
                  {t('viewDetails')}
                </Button>
              ) : (
                '--'
              )
            },
            {
              label: t('currentPrice'),
              value: history?.current ? history.current.toLocaleString() : '--'
            },
            {
              label: t('highest50'),
              value: history.lowest50 ? (
                <PriceWithChange
                  price={history.lowest50}
                  comparePrice={history.current}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('highest50'),
              value: history.highest50 ? (
                <PriceWithChange
                  price={history.highest50}
                  comparePrice={history.current}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('lowest20'),
              value: history.lowest20 ? (
                <PriceWithChange
                  price={history.lowest20}
                  comparePrice={history.current}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('lowest10'),
              value: history.highest20 ? (
                <PriceWithChange
                  price={history.highest20}
                  comparePrice={history.current}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('lowest10'),
              value: history.lowest10 ? (
                <PriceWithChange
                  price={history.lowest10}
                  comparePrice={history.current}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('highest10'),
              value: history.highest10 ? (
                <PriceWithChange
                  price={history.highest10}
                  comparePrice={history.current}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('averagePrice'),
              value: history?.average ? history.average.toLocaleString() : '--'
            },
            {
              label: t('medianPrice'),
              value: history?.median ? history.median.toLocaleString() : '--'
            },
            {
              label: t('sma50Days'),
              value: history?.sma50 ? history.sma50.toLocaleString() : '--'
            },
            {
              label: t('sma20Days'),
              value: history?.sma20 ? history.sma20.toLocaleString() : '--'
            },
            {
              label: t('sma10Days'),
              value: history?.sma10 ? history.sma10.toLocaleString() : '--'
            }
          ].map((item, index) => (
            <Col
              span={width < 500 ? 24 : width < 700 ? 12 : 8}
              key={index}
              css={styles.col}
            >
              <strong>{item.label}:</strong>&nbsp;{item.value}
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
};

const styles = {
  title: css`
    text-align: center;
    font-size: 2rem;
    font-weight: 500;
    margin-bottom: 0;
  `,
  infoGroup: css`
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
  `,
  col: css`
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
  `,
  chartOverviewStyles: css`
    height: 50rem;
    margin-top: 1.6rem;
  `,
  AIExplainBtn: css`
    padding: 0;
    height: unset;
  `
};
