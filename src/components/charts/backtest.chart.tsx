/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { formatNumberShort, formatPercent } from '@/utils/common';
import { useNotification } from '@/hooks/notification.hook';
import { Empty, Select, Spin } from 'antd';

const periodOptions = ['10M', '15M', '30M', '1H'];

type ExtendedCandlestickData = CandlestickData & {
  volume?: number;
  sma_volume?: number;
  sma8_volume?: number;
  sma20_volume?: number;
};

type BacktestSpikeVolumeProps = {
  symbol: string;
  period: string;
  exitPrice: number;
  exitDate: string;
  entryPrice: number;
  entryDate: string;
};

export const ChartBackTest = ({
  symbol,
  period,
  exitPrice,
  exitDate,
  entryPrice,
  entryDate
}: BacktestSpikeVolumeProps) => {
  const { notifyError } = useNotification();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  let animationFrameId: number | null = null;
  const [selectedPeriod, setSelectedPeriod] = useState(
    periodOptions.includes(period) ? period : '1H'
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

  const calculateSMA = (
    data: number[],
    period: number
  ): (number | undefined)[] => {
    const sma: (number | undefined)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(undefined);
      } else {
        const sum = data
          .slice(i - period + 1, i + 1)
          .reduce((acc, val) => acc + val, 0);
        sma.push(sum / period);
      }
    }
    return sma;
  };

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

      const volumes = transformed.map((d) => d.volume ?? 0);
      const sma8Values = calculateSMA(volumes, 8);
      const sma20Values = calculateSMA(volumes, 20);

      const transformedWithSMA = transformed.map((d, i) => ({
        ...d,
        sma8_volume: sma8Values[i],
        sma20_volume: sma20Values[i]
      }));

      setCandlestickData(transformedWithSMA);
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

    const findSwingPoints = (
      data: ExtendedCandlestickData[],
      range: number = 1
    ) => {
      let lastSwingHigh: number | null = null;
      let lastSwingLow: number | null = null;

      for (let i = range; i < data.length - range; i++) {
        const isSwingHigh = data
          .slice(i - range, i + range + 1)
          .every((candle, idx, _arr) => {
            if (idx === range) return true;
            return data[i].high > candle.high;
          });

        const isSwingLow = data
          .slice(i - range, i + range + 1)
          .every((candle, idx, _arr) => {
            if (idx === range) return true;
            return data[i].low < candle.low;
          });

        if (isSwingHigh) {
          lastSwingHigh = data[i].high;
        }

        if (isSwingLow) {
          lastSwingLow = data[i].low;
        }
      }

      return { lastSwingHigh, lastSwingLow };
    };

    const { lastSwingHigh, lastSwingLow } = findSwingPoints(candlestickData, 4);

    if (lastSwingHigh) {
      candleSeries.createPriceLine({
        price: lastSwingHigh,
        color: '#ff4800',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Resistance'
      });
    }

    if (lastSwingLow) {
      candleSeries.createPriceLine({
        price: lastSwingLow,
        color: '#c200e4',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Support'
      });
    }

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

    const volumes = candlestickData.map((d) => d.volume ?? 0);
    const sma20Values = calculateSMA(volumes, 20);
    const sma20VolumeData = candlestickData
      .map((d, i) => ({ time: d.time, value: sma20Values[i] }))
      .filter((d) => d.value !== null);

    const sma20VolumeSeries = chart.addLineSeries({
      color: '#2196f3',
      lineWidth: 2,
      priceScaleId: 'volume'
    });
    sma20VolumeSeries.setData(sma20VolumeData);

    chart.subscribeClick((param) => {
      if (!param || !param.time || !param.seriesData.size) {
        tooltipRef.current!.style.display = 'none';
        return;
      }

      const candle = param.seriesData.get(candleSeries) as CandlestickData;
      const volumeItem = candlestickData.find((d) => d.time === param.time);

      const currentIndex = candlestickData.findIndex(
        (d) => d.time === param.time
      );
      const prevCandle =
        currentIndex > 0 ? candlestickData[currentIndex - 1] : undefined;

      const percentChange =
        prevCandle && prevCandle.close
          ? ((candle.close - prevCandle.close) / prevCandle.close) * 100
          : null;

      const formattedPercent = formatPercent(percentChange);

      const closeChangeColor =
        percentChange !== null
          ? percentChange >= 0
            ? 'var(--positive-color)'
            : 'var(--negative-color)'
          : 'var(--black-color)';

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
        <strong>SMA8 Volume: </strong>${
          volumeItem.sma8_volume
            ? formatNumberShort(volumeItem.sma8_volume)
            : 'N/A'
        }<br/>
        <strong>SMA20 Volume: </strong>${
          volumeItem.sma20_volume
            ? formatNumberShort(volumeItem.sma20_volume)
            : 'N/A'
        }<br/>
        <strong>Open: </strong>${candle.open} <br/>
        <strong>High: </strong>${candle.high} <br/>
        <strong>Low: </strong>${candle.low} <br/>
        <strong>Close: </strong>${candle.close} ${
        formattedPercent
          ? `<span style="color:${closeChangeColor}">(${formattedPercent})</span>`
          : ''
      }
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
    </Spin>
  );
};

const styles = {
  empty: css`
    padding: 4rem 0;
  `,
  chartContainer: css`
    margin-top: 2rem;
    width: 100%;
    height: 40rem;
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
  `
};
