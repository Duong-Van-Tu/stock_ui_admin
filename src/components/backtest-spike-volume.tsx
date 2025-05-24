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
import {
  formatNumberShort,
  formatPercent,
  roundToDecimals
} from '@/utils/common';
import { PositiveNegativeText } from './positive-negative-text';

type ExtendedCandlestickData = CandlestickData & {
  volume?: number;
  sma_volume?: number;
};

type BacktestSpikeVolumeProps = {
  symbol: string;
  period: string;
  entryPrice: number;
  entryTime: string;
  exitPrice?: number;
  exitTime?: string;
};

export const BacktestSpikeVolume = ({
  symbol,
  period,
  entryPrice,
  entryTime,
  exitPrice,
  exitTime
}: BacktestSpikeVolumeProps) => {
  const t = useTranslations();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  let animationFrameId: number | null = null;
  const [candlestickData, setCandlestickData] = useState<
    ExtendedCandlestickData[]
  >([]);

  const parseToUnixTime = useCallback(
    (timestamp: string): number => {
      const entry = dayjs(timestamp).tz(TimeZone.NEW_YORK);
      const periodMinutes = parseInt(period);
      const rounded = entry
        .minute(Math.floor(entry.minute() / periodMinutes) * periodMinutes)
        .second(0);
      return Math.floor(rounded.valueOf() / 1000);
    },
    [period]
  );

  const fetchCandlestickChartData = useCallback(async () => {
    if (!entryTime) return;

    const fromDate = dayjs(entryTime)
      .subtract(7, 'day')
      .tz(TimeZone.NEW_YORK)
      .format('YYYY-MM-DD');
    const toDate = exitTime
      ? dayjs(exitTime).add(7, 'day').tz(TimeZone.NEW_YORK).format('YYYY-MM-DD')
      : dayjs(entryTime)
          .add(7, 'day')
          .tz(TimeZone.NEW_YORK)
          .format('YYYY-MM-DD');

    try {
      const res = await defaultApiFetcher.get('stock-worker/get-stock-chart', {
        query: {
          stockName: symbol,
          period,
          smaPeriodLength: 20,
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
      console.error('Error fetching stock chart:', err);
    }
  }, [symbol, period, entryTime, exitTime]);

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
      const hasExit = exitPrice !== undefined && exitTime;
      const isProfit = hasExit ? exitPrice! >= entryPrice : false;

      if (entryTime) {
        markers.push({
          time: parseToUnixTime(entryTime),
          position: isProfit ? 'belowBar' : 'aboveBar',
          color: isProfit ? 'red' : 'green',
          shape: isProfit ? 'arrowDown' : 'arrowUp',
          text: `Entry`
        });
      }

      if (hasExit) {
        markers.push({
          time: parseToUnixTime(exitTime!),
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
    entryTime,
    exitPrice,
    exitTime,
    parseToUnixTime
  ]);

  return (
    <>
      <h3
        css={css`
          text-align: center;
          font-size: 2rem;
          font-weight: 500;
          margin-bottom: 0;
        `}
      >
        {symbol}
      </h3>
      <div
        css={css`
          display: flex;
          flex-direction: column;
        `}
      >
        <div>
          <strong>{t('entryDate')}:</strong> &nbsp;
          {dayjs(entryTime).tz(TimeZone.NEW_YORK).format('MM-DD-YYYY HH:mm:ss')}
        </div>
        <div>
          <strong>{t('entryPrice')}:</strong> &nbsp;{' '}
          <span>${roundToDecimals(entryPrice, 2)}</span>
        </div>
        {exitPrice && exitTime && (
          <>
            <div>
              <strong>{t('exitDate')}:</strong> &nbsp;
              {dayjs(exitTime)
                .tz(TimeZone.NEW_YORK)
                .format('MM-DD-YYYY HH:mm:ss')}
            </div>
            <div>
              <strong>{t('exitPrice')}:</strong> &nbsp;
              <PositiveNegativeText
                isNegative={exitPrice < entryPrice}
                isPositive={exitPrice > entryPrice}
              >
                <span>
                  ${roundToDecimals(exitPrice, 2)}&nbsp;(
                  {formatPercent(((exitPrice - entryPrice) / entryPrice) * 100)}
                  )
                </span>
              </PositiveNegativeText>
            </div>
          </>
        )}
      </div>
      <div
        ref={chartContainerRef}
        css={css`
          margin-top: 2rem;
          width: 100%;
          height: 400px;
          position: relative;
          #tv-attr-logo {
            display: none;
          }
        `}
      >
        <div
          ref={tooltipRef}
          css={css`
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
          `}
        />
      </div>
    </>
  );
};
