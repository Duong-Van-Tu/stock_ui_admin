/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  createChart,
  type CandlestickData,
  type ChartOptions,
  type DeepPartial,
  type IChartApi,
  type SeriesMarker
} from 'lightweight-charts';
import { TimeZone } from '@/constants/timezone.constant';
import { defaultApiFetcher } from '@/utils/api-instances';
import { formatNumberShort, roundToDecimals } from '@/utils/common';
import { PositiveNegativeText } from './positive-negative-text';
import { useNotification } from '@/hooks/notification.hook';
import { Empty, Spin, Select, Row, Col } from 'antd';
import {
  Recommendation,
  RecommendationText
} from '@/constants/common.constant';
import { useWindowSize } from '@/hooks/window-size.hook';

type ExtendedCandlestickData = CandlestickData & {
  volume?: number;
  sma_volume?: number;
};

type BacktestSpikeVolumeProps = {
  signal: Signal;
};

const periodOptions = ['10M', '15M', '30M', '1H'];

export const SignalInformation = ({ signal }: BacktestSpikeVolumeProps) => {
  const t = useTranslations();
  const { notifyError } = useNotification();
  const { width } = useWindowSize();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const {
    symbol,
    timeFrame: period,
    exitPrice,
    exitDate,
    entryPrice,
    entryDate
  } = signal;
  let animationFrameId: number | null = null;

  const [selectedPeriod, setSelectedPeriod] = useState(
    periodOptions.includes(signal.timeFrame) ? period : '1H'
  );
  const [candlestickData, setCandlestickData] = useState<
    ExtendedCandlestickData[]
  >([]);
  const [loading, setLoading] = useState(true);

  const parseToUnixTime = useCallback(
    (timestamp: string): number => {
      const entry = dayjs(timestamp).tz(TimeZone.NEW_YORK);
      const periodMinutes = parseInt(selectedPeriod);
      const rounded = entry
        .minute(Math.floor(entry.minute() / periodMinutes) * periodMinutes)
        .second(0);
      return Math.floor(rounded.valueOf() / 1000);
    },
    [selectedPeriod]
  );

  const fetchCandlestickChartData = useCallback(async () => {
    if (!entryDate) return;
    if (dayjs(entryDate).isBefore(dayjs().subtract(19, 'day'))) {
      setLoading(false);
      return;
    }

    const fromDate = dayjs()
      .subtract(19, 'day')
      .tz(TimeZone.NEW_YORK)
      .format('YYYY-MM-DD');

    const toDate = dayjs().tz(TimeZone.NEW_YORK).format('YYYY-MM-DD');

    try {
      const res = await defaultApiFetcher.get('stock-worker/get-stock-chart', {
        query: {
          stockName: symbol,
          period: selectedPeriod,
          smaPeriodLength: 8,
          fromDate,
          toDate
        }
      });

      const data = res.data || [];

      const transformed: ExtendedCandlestickData[] = data.map((item: any) => ({
        time: Math.floor(item.timestamp / 1000),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        sma_volume: item.sma_volume
      }));

      setCandlestickData(transformed);
    } catch (err) {
      notifyError('Error fetching stock chart');
      console.error('Error fetching stock chart:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol, selectedPeriod, entryDate, notifyError]);

  useEffect(() => {
    fetchCandlestickChartData();
  }, [fetchCandlestickChartData]);

  useEffect(() => {
    if (!chartContainerRef.current || candlestickData.length === 0) return;

    const chartOptions: DeepPartial<ChartOptions> = {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333'
      },
      grid: {
        vertLines: { color: '#eee' },
        horzLines: { color: '#eee' }
      },
      crosshair: { mode: 0 },
      timeScale: {
        borderColor: '#ccc',
        timeVisible: true,
        tickMarkFormatter: (timestamp: any) => {
          return dayjs
            .unix(timestamp)
            .tz(TimeZone.NEW_YORK)
            .format('MM-DD HH:mm');
        }
      },
      rightPriceScale: {
        borderColor: '#ccc'
      },
      watermark: {
        visible: false
      }
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    chart.applyOptions({
      localization: {
        timeFormatter: (time: any) => {
          const timestamp =
            typeof time === 'number'
              ? time
              : dayjs(`${time.year}-${time.month}-${time.day}`).unix();
          return dayjs
            .unix(timestamp)
            .tz(TimeZone.NEW_YORK)
            .format("DD MMM 'YY HH:mm:ss");
        }
      }
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350'
    });

    candleSeries.setData(candlestickData);

    const markers: SeriesMarker<any>[] = [];
    try {
      const hasExit = exitPrice !== undefined && exitDate;
      const isProfit = hasExit ? exitPrice! >= entryPrice : false;

      if (entryDate) {
        markers.push({
          time: parseToUnixTime(entryDate),
          position: isProfit ? 'belowBar' : 'aboveBar',
          color: isProfit ? 'red' : 'green',
          shape: isProfit ? 'arrowDown' : 'arrowUp',
          text: `Entry`
        });
      }

      if (hasExit) {
        markers.push({
          time: parseToUnixTime(exitDate!),
          position: isProfit ? 'aboveBar' : 'belowBar',
          color: isProfit ? 'green' : 'red',
          shape: isProfit ? 'arrowUp' : 'arrowDown',
          text: `Exit`
        });
      }

      candleSeries.setMarkers(markers);
    } catch (error) {
      console.error('Error setting markers:', error);
    }

    const volumeSeries = chart.addHistogramSeries({
      color: '#8884d8',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume'
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    });

    const volumeData = candlestickData.map((data) => ({
      time: data.time,
      value: data.volume ?? 0,
      color: data.close > data.open ? '#26a69a' : '#ef5350'
    }));
    volumeSeries.setData(volumeData);

    const smaVolumeSeries = chart.addLineSeries({
      color: '#fbc02d',
      lineWidth: 2,
      priceScaleId: 'volume'
    });

    const smaVolumeData = candlestickData
      .filter((d) => typeof d.sma_volume === 'number')
      .map((d) => ({
        time: d.time,
        value: d.sma_volume!
      }));
    smaVolumeSeries.setData(smaVolumeData);

    chart.subscribeClick((param) => {
      if (!param || !param.time || !param.seriesData.size) {
        tooltipRef.current!.style.display = 'none';
        return;
      }

      const candle = param.seriesData.get(candleSeries) as CandlestickData;
      const volumeItem = candlestickData.find((d) => d.time === param.time);

      if (!candle || !volumeItem) {
        tooltipRef.current!.style.display = 'none';
        return;
      }

      const tooltip = tooltipRef.current!;
      tooltip.style.display = 'block';
      tooltip.style.left = `${param.point?.x}px`;
      tooltip.style.top = `${param.point?.y}px`;

      tooltip.innerHTML = `
        <strong>${dayjs
          .unix(Number(param.time))
          .tz(TimeZone.NEW_YORK)
          .format('MM-DD HH:mm:ss')}</strong><br/>
        <strong>Volume: </strong>${formatNumberShort(
          volumeItem.volume || 0
        )}<br/>
        <strong>Open: </strong>${candle.open} <br/>
        <strong>High: </strong>${candle.high} <br/>
        <strong>Low: </strong>${candle.low} <br/>
        <strong>Close: </strong>${candle.close}
      `;
    });

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: chartContainerRef.current!.clientWidth
      });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      chart.remove();
      resizeObserver.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [
    candlestickData,
    entryPrice,
    entryDate,
    exitPrice,
    exitDate,
    animationFrameId,
    parseToUnixTime
  ]);

  return (
    <Spin spinning={loading}>
      <h3 css={styles.title}>{`${t('symbol')}: ${symbol}`}</h3>
      <div css={styles.selectWrapper}>
        <Select
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          css={styles.selectPeriod}
          options={periodOptions.map((p) => ({
            value: p,
            label: `${p}`
          }))}
          size='small'
        />
      </div>

      {candlestickData.length === 0 ? (
        <Empty css={styles.empty} />
      ) : (
        <div ref={chartContainerRef} css={styles.chartContainer}>
          <div ref={tooltipRef} css={styles.tooltip} />
        </div>
      )}

      <div css={styles.infoGroup}>
        <Row gutter={[32, 8]}>
          {[
            { label: t('companyName'), value: signal.companyName },
            { label: t('period'), value: signal.timeFrame },
            {
              label: t('entryDate'),
              value: signal.entryDate
                ? dayjs(signal.entryDate)
                    .tz(TimeZone.NEW_YORK)
                    .format('MM-DD-YYYY HH:mm:ss')
                : '--'
            },
            {
              label: t('entryPrice'),
              value: signal.entryPrice
                ? `$${roundToDecimals(signal.entryPrice, 2)}`
                : '--'
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
              value: signal.exitPrice
                ? `$${roundToDecimals(signal.exitPrice, 2)}`
                : '--'
            },
            {
              label: t('currentPrice'),
              value: signal.currentPrice
                ? `$${roundToDecimals(signal.currentPrice, 2)}`
                : '--'
            },
            {
              label: t('highestPrice'),
              value: signal.highestPrice
                ? `$${roundToDecimals(signal.highestPrice, 2)}`
                : '--'
            },
            {
              label: t('lowestPrice'),
              value: signal.lowestPrice
                ? `$${roundToDecimals(signal.lowestPrice, 2)}`
                : '--'
            },
            { label: t('aiRating'), value: signal.AIRating ?? '--' },
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
              label: t('totalScore'),
              value: signal.totalScore
                ? roundToDecimals(signal.totalScore, 2)
                : '--'
            },
            {
              label: t('fundamentalScore'),
              value: signal.fundamentalScore
                ? roundToDecimals(signal.fundamentalScore, 2)
                : '--'
            },
            {
              label: t('sentimentScore'),
              value: signal.sentimentScore
                ? roundToDecimals(signal.sentimentScore, 2)
                : '--'
            },
            {
              label: t('earningsScore'),
              value: signal.earningsScore
                ? roundToDecimals(signal.earningsScore, 2)
                : '--'
            },
            {
              label: t('marketCap'),
              value: signal.marketCap
                ? formatNumberShort(signal.marketCap)
                : '--'
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
              value: signal.atr
                ? `${roundToDecimals(signal.atr, 2)} (${roundToDecimals(
                    signal.atrPercent,
                    2
                  )}%)`
                : '--'
            },
            {
              label: t('ytd'),
              value: signal.ytd ? `${roundToDecimals(signal.ytd, 2)}%` : '--'
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
    </Spin>
  );
};

const styles = {
  title: css`
    text-align: center;
    font-size: 2rem;
    font-weight: 500;
    margin-bottom: 0;
  `,
  infoContainer: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin: 1rem 0;
  `,
  infoGroup: css`
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
  `,
  recommendationText: css`
    text-transform: uppercase;
  `,
  empty: css`
    padding: 4rem 0;
  `,
  chartContainer: css`
    margin-top: 2rem;
    width: 100%;
    height: 400px;
    position: relative;

    #tv-attr-logo {
      display: none;
    }
  `,
  tooltip: css`
    position: absolute;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 4px;
    pointer-events: none;
    font-size: 0.875rem;
    display: none;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    font-size: 1.4rem;
  `,

  selectWrapper: css`
    width: 100%;
    display: flex;
    justify-content: flex-end;
  `,

  selectPeriod: css`
    width: 8rem;
  `,

  col: css`
    display: flex;
    justify-content: space-between;
  `,

  recommendation: css`
    text-transform: uppercase;
  `
};
