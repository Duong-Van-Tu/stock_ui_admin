/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { TimeZone } from '@/constants/timezone.constant';
import {
  calculatePercentage,
  formatMarketCap,
  formatNumberShort,
  formatPercent,
  isNumeric,
  roundToDecimals
} from '@/utils/common';
import { PositiveNegativeText } from './positive-negative-text';
import { Row, Col, Button, Modal } from 'antd';
import {
  Recommendation,
  RecommendationText
} from '@/constants/common.constant';
import { useWindowSize } from '@/hooks/window-size.hook';
import { PriceWithChange } from './price-with-change';
import { ChartBackTest } from './charts/backtest.chart';
import EllipsisText from './ellipsis-text';

type BacktestSpikeVolumeProps = {
  signal: Signal;
};

export const SignalInformation = ({ signal }: BacktestSpikeVolumeProps) => {
  const t = useTranslations();
  const { width } = useWindowSize();
  const [modal, contextHolder] = Modal.useModal();

  return (
    <>
      {contextHolder}
      <h3 css={styles.title}>{`${t('symbol')}: ${signal.symbol}`}</h3>
      <ChartBackTest
        symbol={signal.symbol}
        period={signal.timeFrame}
        exitPrice={signal.exitPrice}
        exitDate={signal.exitDate}
        entryPrice={signal.entryPrice}
        entryDate={signal.entryDate}
      />
      <div css={styles.infoGroup}>
        <Row gutter={[32, 8]}>
          {[
            {
              label: t('companyName'),
              value: signal.companyName?.trim() ? signal.companyName : '--'
            },
            {
              label: t('strategy'),
              value:
                <EllipsisText text={signal.strategyName} maxLines={1} /> || '--'
            },
            { label: t('period'), value: signal.timeFrame },
            {
              label: t('realCandleEntry'),
              value: signal.realCandleEntry
                ? dayjs(signal.realCandleEntry)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('expectCandleEntry'),
              value: signal.expectCandleEntry
                ? dayjs(signal.expectCandleEntry)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('entryDate'),
              value: signal.entryDate
                ? dayjs(signal.entryDate)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('entryPrice'),
              value: signal.entryPrice
                ? `$${roundToDecimals(signal.entryPrice, 2)}`
                : '--'
            },
            {
              label: t('takeProfit'),
              value:
                signal.takeProfit && signal.entryPrice ? (
                  <div>
                    ${roundToDecimals(signal.takeProfit, 2)}&nbsp;
                    <PositiveNegativeText
                      isPositive={signal.takeProfit > signal.entryPrice}
                      isNegative={signal.takeProfit < signal.entryPrice}
                    >
                      (
                      {formatPercent(
                        calculatePercentage(
                          signal.entryPrice,
                          signal.takeProfit
                        ),
                        2
                      )}
                      )
                    </PositiveNegativeText>
                  </div>
                ) : (
                  '--'
                )
            },
            {
              label: t('stopLoss'),
              value:
                signal.stopLoss && signal.entryPrice ? (
                  <div>
                    ${roundToDecimals(signal.stopLoss, 2)}&nbsp;
                    <PositiveNegativeText
                      isPositive={signal.stopLoss > signal.entryPrice}
                      isNegative={signal.stopLoss < signal.entryPrice}
                    >
                      (
                      {formatPercent(
                        calculatePercentage(signal.entryPrice, signal.stopLoss),
                        2
                      )}
                      )
                    </PositiveNegativeText>
                  </div>
                ) : (
                  '--'
                )
            },
            {
              label: t('newStopLoss'),
              value:
                signal?.newStopLoss && signal.entryPrice ? (
                  <div>
                    ${roundToDecimals(signal.newStopLoss, 2)}
                    &nbsp;
                    <PositiveNegativeText
                      isPositive={signal.newStopLoss > signal.entryPrice}
                      isNegative={signal.newStopLoss < signal.entryPrice}
                    >
                      (
                      {formatPercent(
                        calculatePercentage(
                          signal.entryPrice,
                          signal.newStopLoss
                        ),
                        2
                      )}
                      )
                    </PositiveNegativeText>
                  </div>
                ) : (
                  '--'
                )
            },

            ...(signal.timeFrame === '15M'
              ? [
                  {
                    label: 'M15 - SMA Vol',
                    value: signal.spikeVolumeM15Info
                      ? roundToDecimals(signal.spikeVolumeM15Info.smaVol, 2)
                      : '--'
                  },
                  {
                    label: 'M15 - Strike Vol',
                    value: signal.spikeVolumeM15Info
                      ? `${signal.spikeVolumeM15Info.strikeVol} | ${
                          signal.spikeVolumeM15Info.strikeTime || '--'
                        }`
                      : '--'
                  },
                  {
                    label: 'M15 - Confirm Vol',
                    value: signal.spikeVolumeM15Info
                      ? `${
                          signal.spikeVolumeM15Info.confirmVol
                        } | P: ${roundToDecimals(
                          signal.spikeVolumeM15Info.confirmPrice,
                          2
                        )} | ${signal.spikeVolumeM15Info.confirmTime || '--'}`
                      : '--'
                  }
                ]
              : []),
            ...(signal.timeFrame === '1H'
              ? [
                  {
                    label: 'H1 - SMA Vol',
                    value: signal.spikeVolumeH1Info
                      ? roundToDecimals(signal.spikeVolumeH1Info.smaVol, 2)
                      : '--'
                  },
                  {
                    label: 'H1 - Strike Vol',
                    value: signal.spikeVolumeH1Info
                      ? `${signal.spikeVolumeH1Info.strikeVol} | ${
                          signal.spikeVolumeH1Info.strikeTime || '--'
                        }`
                      : '--'
                  }
                ]
              : []),
            {
              label: t('aiRecommendation'),
              value: signal.AIRecommendationSignal ? (
                <PositiveNegativeText
                  isPositive={
                    signal.AIRecommendationSignal === Recommendation.BUY
                  }
                  isNegative={
                    signal.AIRecommendationSignal === Recommendation.SELL
                  }
                >
                  <span css={styles.recommendation}>
                    {RecommendationText[signal.AIRecommendationSignal]}
                  </span>
                </PositiveNegativeText>
              ) : (
                <span>-</span>
              )
            },
            {
              label: t('manualRecommendation'),
              value: signal.manualRecommendation ? (
                <PositiveNegativeText
                  isPositive={
                    signal.manualRecommendation === Recommendation.BUY ||
                    signal.manualRecommendation === Recommendation.STRONG_BUY
                  }
                  isNegative={
                    signal.manualRecommendation === Recommendation.SELL
                  }
                >
                  <span css={styles.recommendationText}>
                    {RecommendationText[signal.manualRecommendation]}
                  </span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
            },
            {
              label: t('aiExplain'),
              value: signal.AIExplain ? (
                <Button
                  css={styles.AIExplainBtn}
                  type='link'
                  onClick={() =>
                    modal.confirm({
                      title: t('aiExplain'),
                      content: signal.AIExplain,
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
              label: t('exitDate'),
              value: signal.exitDate
                ? dayjs(signal.exitDate)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm:ss')
                : '--'
            },
            {
              label: t('exitPrice'),
              value: signal.exitPrice ? (
                <PriceWithChange
                  price={signal.exitPrice}
                  comparePrice={signal.entryPrice}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('currentPrice'),
              value: signal.currentPrice ? (
                <PriceWithChange
                  price={signal.currentPrice}
                  comparePrice={signal.entryPrice}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('highestPrice'),
              value: signal.highestPrice ? (
                <PriceWithChange
                  price={signal.highestPrice}
                  comparePrice={signal.entryPrice}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('highestPriceDate'),
              value: signal.highestUpdateAt
                ? dayjs(signal.highestUpdateAt)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('highestPrice3Days'),
              value: signal.highestPrice3Days ? (
                <PriceWithChange
                  price={signal.highestPrice3Days}
                  comparePrice={signal.entryPrice}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('highest3DaysUpdateAt'),
              value: signal.highest3DaysUpdateAt
                ? dayjs(signal.highest3DaysUpdateAt)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('highestPrice7Days'),
              value: signal.highestPrice7Days ? (
                <PriceWithChange
                  price={signal.highestPrice7Days}
                  comparePrice={signal.entryPrice}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('highest7DaysUpdateAt'),
              value: signal.highest7DaysUpdateAt
                ? dayjs(signal.highest7DaysUpdateAt)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('lowestPrice'),
              value: signal.lowestPrice ? (
                <PriceWithChange
                  price={signal.lowestPrice}
                  comparePrice={signal.entryPrice}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('lowestPriceDate'),
              value: signal.lowestUpdateAt
                ? dayjs(signal.lowestUpdateAt)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('lowestPrice3Days'),
              value: signal.lowestPrice3Days ? (
                <PriceWithChange
                  price={signal.lowestPrice3Days}
                  comparePrice={signal.entryPrice}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('lowest3DaysUpdateAt'),
              value: signal.lowest3DaysUpdateAt
                ? dayjs(signal.lowest3DaysUpdateAt)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('lowestPrice7Days'),
              value: signal.lowestPrice7Days ? (
                <PriceWithChange
                  price={signal.lowestPrice7Days}
                  comparePrice={signal.entryPrice}
                />
              ) : (
                '--'
              )
            },
            {
              label: t('lowest7DaysUpdateAt'),
              value: signal.lowest7DaysUpdateAt
                ? dayjs(signal.lowest7DaysUpdateAt)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm')
                : '--'
            },
            {
              label: t('earningsNext3Days'),
              value: signal.earningDate3days ? t('yes') : t('no')
            },
            {
              label: t('aiRating'),
              value: signal.AIRating ?? '--'
            },
            {
              label: t('totalScore'),
              value: isNumeric(signal.totalScore) ? (
                <PositiveNegativeText
                  isPositive={signal.totalScore > 7}
                  isNegative={signal.totalScore < 4}
                >
                  <span>{roundToDecimals(signal.totalScore, 2)}</span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
            },
            {
              label: t('fundamentalScore'),
              value: isNumeric(signal.fundamentalScore) ? (
                <PositiveNegativeText
                  isPositive={signal.fundamentalScore > 7}
                  isNegative={signal.fundamentalScore < 4}
                >
                  <span>{roundToDecimals(signal.fundamentalScore, 2)}</span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
            },
            {
              label: t('sentimentScore'),
              value: isNumeric(signal.sentimentScore) ? (
                <PositiveNegativeText
                  isPositive={signal.sentimentScore > 7}
                  isNegative={signal.sentimentScore < 4}
                >
                  <span>{roundToDecimals(signal.sentimentScore, 2)}</span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
            },
            {
              label: t('earningsScore'),
              value: isNumeric(signal.earningsScore) ? (
                <PositiveNegativeText
                  isPositive={signal.earningsScore > 7}
                  isNegative={signal.earningsScore < 4}
                >
                  <span>{roundToDecimals(signal.earningsScore, 2)}</span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
            },
            {
              label: t('marketCap'),
              value: signal.marketCap ? formatMarketCap(signal.marketCap) : '--'
            },
            {
              label: t('volume'),
              value: signal.volumeAVG
                ? formatNumberShort(signal.volumeAVG)
                : '--'
            },
            {
              label: t('beta'),
              value: signal.beta ? roundToDecimals(signal.beta, 2) : '--'
            },
            {
              label: t('atr'),
              value: signal.atr ? (
                <PositiveNegativeText
                  isPositive={signal.atrPercent > 0}
                  isNegative={signal.atrPercent < 0}
                >
                  <span>
                    {roundToDecimals(signal.atr, 2)} (
                    {formatPercent(signal.atrPercent, 2)})
                  </span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
            },
            {
              label: t('ytd'),
              value: signal.ytd ? (
                <PositiveNegativeText
                  isPositive={signal.ytd > 0}
                  isNegative={signal.ytd < 0}
                >
                  <span>{roundToDecimals(signal.ytd, 2)}%</span>
                </PositiveNegativeText>
              ) : (
                '--'
              )
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
  recommendationText: css`
    text-transform: uppercase;
  `,
  col: css`
    display: flex;
    justify-content: space-between;
  `,
  recommendation: css`
    text-transform: uppercase;
  `,
  AIExplainBtn: css`
    padding: 0;
    height: unset;
  `
};
