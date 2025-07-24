/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { TimeZone } from '@/constants/timezone.constant';
import { formatPercent, roundToDecimals } from '@/utils/common';
import { Row, Col } from 'antd';
import { useWindowSize } from '@/hooks/window-size.hook';
import { PriceWithChange } from './price-with-change';
import { useMemo } from 'react';
import { PositiveNegativeText } from './positive-negative-text';
import { calculateDIM } from '@/helpers/ledger-entry.helper';
import EllipsisText from './ellipsis-text';
import StockOverviewChart from './charts/stock-overview.chart';

type LedgerEntryInformationProps = {
  entry: LedgerEntry;
};

export const LedgerEntryInformation = ({
  entry
}: LedgerEntryInformationProps) => {
  const t = useTranslations();
  const { width } = useWindowSize();
  const {
    symbol,
    period,
    entryDate,
    entryPrice,
    exitDate,
    exitPrice,
    strategy,
    investmentCashIn = 0,
    investmentCashOut = 0,
    commission = 0,
    stockPL,
    action,
    strike,
    expiration,
    premiumPaid,
    premiumReceive,
    contracts,
    sector,
    notes
  } = entry;

  const { winOrLoss, netProfitOrLoss, plAmount, plAmountPercent } =
    useMemo(() => {
      const hasValidData = investmentCashIn && investmentCashOut;
      if (!hasValidData) {
        return {
          winOrLoss: null,
          netProfitOrLoss: null,
          plAmount: null,
          plAmountPercent: null
        };
      }

      const net = investmentCashIn - investmentCashOut - commission;
      const percent = (net / investmentCashOut) * 100;

      return {
        winOrLoss: net >= 0 ? t('win') : t('loss'),
        netProfitOrLoss: net,
        plAmount: net,
        plAmountPercent: percent
      };
    }, [investmentCashIn, investmentCashOut, commission, t]);

  return (
    <>
      <h3 css={styles.title}>{`${t('symbol')}: ${symbol}`}</h3>
      <div css={styles.stockOverviewChart}>
        <StockOverviewChart symbol={symbol} />
      </div>
      <div css={styles.infoGroup}>
        <Row gutter={[32, 8]}>
          {[
            { label: t('strategy'), value: strategy || '--' },
            { label: t('period'), value: period },

            {
              label: t('entryDate'),
              value: entryDate
                ? dayjs(entryDate)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('entryPrice'),
              value: entryPrice ? `$${roundToDecimals(entryPrice, 2)}` : '--'
            },
            {
              label: t('holdingTime'),
              value:
                entryDate && exitDate ? calculateDIM(entryDate, exitDate) : '--'
            },
            {
              label: t('exitDate'),
              value: exitDate
                ? dayjs(exitDate)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm:ss')
                : '--'
            },
            {
              label: t('exitPrice'),
              value: exitPrice ? (
                <PriceWithChange price={exitPrice} comparePrice={entryPrice} />
              ) : (
                '--'
              )
            },
            {
              label: t('winOrLoss'),
              value: winOrLoss ? (
                <PositiveNegativeText
                  isPositive={netProfitOrLoss >= 0}
                  isNegative={netProfitOrLoss < 0}
                >
                  <span>{winOrLoss}</span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
            },
            {
              label: t('StockP/L'),
              value: stockPL ? (
                <PositiveNegativeText
                  isPositive={stockPL > 0}
                  isNegative={stockPL < 0}
                >
                  <span>{formatPercent(stockPL, 2)}</span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
            },
            {
              label: t('actions'),
              value: action ? action : '--'
            },
            {
              label: t('strike'),
              value: strike ? strike : '--'
            },
            {
              label: t('expiration'),
              value: expiration
                ? dayjs(expiration).tz(TimeZone.NEW_YORK).format('MM/DD/YYYY')
                : '--'
            },
            {
              label: t('premiumPaid'),
              value: premiumPaid ? `$${premiumPaid}` : '--'
            },
            {
              label: t('premiumReceive'),
              value: premiumReceive ? `$${premiumReceive}` : '--'
            },
            {
              label: t('investmentCashOut'),
              value: investmentCashOut ? `$${investmentCashOut}` : '--'
            },
            {
              label: t('investmentCashIn'),
              value: investmentCashIn ? `$${investmentCashIn}` : '--'
            },
            {
              label: t('contracts'),
              value: contracts ? contracts : '--'
            },
            {
              label: t('commission'),
              value: commission ? `$${commission}` : '--'
            },
            {
              label: t('pl'),
              value: plAmount ? (
                <>
                  <PositiveNegativeText
                    isPositive={plAmountPercent > 0}
                    isNegative={plAmountPercent < 0}
                  >
                    <span>
                      ${roundToDecimals(plAmount, 2)} (
                      {formatPercent(plAmountPercent, 2)})
                    </span>
                  </PositiveNegativeText>
                </>
              ) : (
                '--'
              )
            },
            {
              label: t('sector'),
              value: sector ? <EllipsisText text={sector} maxLines={1} /> : '--'
            },
            {
              label: t('notes'),
              value: notes ? <EllipsisText text={notes} maxLines={1} /> : '--'
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
  stockOverviewChart: css`
    height: 50rem;
  `
};
