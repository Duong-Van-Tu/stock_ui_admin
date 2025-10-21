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
  type SeriesMarker,
  type UTCTimestamp,
  type LineData,
  type HistogramData,
  type ISeriesApi,
  LineStyle
} from 'lightweight-charts';
import { TimeZone } from '@/constants/timezone.constant';
import { defaultApiFetcher } from '@/utils/api-instances';
import { useNotification } from '@/hooks/notification.hook';
import { Empty, Select, Spin } from 'antd';
import { formatNumberShort, formatPercent } from '@/utils/common';

const periodOptions = ['15M', '1H'];

type ExtendedCandlestickData = Omit<CandlestickData, 'time'> & {
  time: UTCTimestamp;
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
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const smaVolumeSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma20VolumeSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const supportLineRef = useRef<ReturnType<
    NonNullable<typeof candleSeriesRef.current>['createPriceLine']
  > | null>(null);
  const resistanceLineRef = useRef<ReturnType<
    NonNullable<typeof candleSeriesRef.current>['createPriceLine']
  > | null>(null);

  const rsi3SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsi5SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const tenkan135SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState(
    periodOptions.includes(period) ? period : '1H'
  );
  const [candlestickData, setCandlestickData] = useState<
    ExtendedCandlestickData[]
  >([]);
  const [loading, setLoading] = useState(true);

  const tooltipVisibleRef = useRef(false);

  const dataRef = useRef<ExtendedCandlestickData[]>([]);
  const supLowerMapRef = useRef<Map<UTCTimestamp | string, number>>(new Map());
  const supUpperMapRef = useRef<Map<UTCTimestamp | string, number>>(new Map());
  const resLowerMapRef = useRef<Map<UTCTimestamp | string, number>>(new Map());
  const resUpperMapRef = useRef<Map<UTCTimestamp | string, number>>(new Map());

  const periodToMinutes = useCallback((p: string) => {
    const n = parseInt(p, 10);
    return p.endsWith('H') ? n * 60 : n;
  }, []);

  const parseToUnixTime = useCallback(
    (timestamp: string): UTCTimestamp => {
      const entry = dayjs(timestamp).tz(TimeZone.NEW_YORK);
      const periodMinutes = periodToMinutes(selectedPeriod);
      const rounded = entry
        .minute(Math.floor(entry.minute() / periodMinutes) * periodMinutes)
        .second(0);
      return Math.floor(rounded.valueOf() / 1000) as UTCTimestamp;
    },
    [selectedPeriod, periodToMinutes]
  );

  const calculateSMA = (
    data: number[],
    period: number
  ): (number | undefined)[] => {
    const sma: (number | undefined)[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) sma.push(undefined);
      else
        sma.push(
          data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
        );
    }
    return sma;
  };

  const calculateRSI = (
    closes: number[],
    period: number
  ): (number | undefined)[] => {
    const out: (number | undefined)[] = new Array(closes.length).fill(
      undefined
    );
    if (closes.length < period + 1) return out;
    let gain = 0;
    let loss = 0;
    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      if (change >= 0) gain += change;
      else loss -= change;
    }
    let avgGain = gain / period;
    let avgLoss = loss / period;
    out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const g = Math.max(change, 0);
      const l = Math.max(-change, 0);
      avgGain = (avgGain * (period - 1) + g) / period;
      avgLoss = (avgLoss * (period - 1) + l) / period;
      out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }
    return out;
  };

  const calculateTenkan = (
    data: ExtendedCandlestickData[],
    period: number
  ): (number | undefined)[] => {
    const out: (number | undefined)[] = new Array(data.length).fill(undefined);
    if (period <= 1) return data.map((d) => (d.high + d.low) / 2);
    for (let i = period - 1; i < data.length; i++) {
      let hi = -Infinity,
        lo = Infinity;
      for (let j = i - period + 1; j <= i; j++) {
        hi = Math.max(hi, data[j].high);
        lo = Math.min(lo, data[j].low);
      }
      out[i] = (hi + lo) / 2;
    }
    return out;
  };

  const getRollingHiLoSeries = (
    data: ExtendedCandlestickData[],
    windowSize = 50
  ) => {
    const hiSeries: LineData<UTCTimestamp>[] = [];
    const loSeries: LineData<UTCTimestamp>[] = [];
    if (!data.length || windowSize <= 1) return { hi: hiSeries, lo: loSeries };

    const dqHi: number[] = [];
    const dqLo: number[] = [];
    for (let i = 0; i < data.length; i++) {
      while (dqHi.length && data[dqHi[dqHi.length - 1]].high <= data[i].high)
        dqHi.pop();
      dqHi.push(i);
      while (dqLo.length && data[dqLo[dqLo.length - 1]].low >= data[i].low)
        dqLo.pop();
      dqLo.push(i);

      const left = i - windowSize + 1;
      while (dqHi.length && dqHi[0] < left) dqHi.shift();
      while (dqLo.length && dqLo[0] < left) dqLo.shift();

      if (i >= windowSize - 1) {
        const t = data[i].time as UTCTimestamp;
        hiSeries.push({ time: t, value: data[dqHi[0]].high });
        loSeries.push({ time: t, value: data[dqLo[0]].low });
      }
    }
    return { hi: hiSeries, lo: loSeries };
  };

  const fetchCandlestickChartData = useCallback(async () => {
    if (!entryDate) return;

    const fromDate = dayjs()
      .subtract(49, 'day')
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
        time: Math.floor(item.timestamp / 1000) as UTCTimestamp,
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

  const ensureOverlayCanvas = useCallback(() => {
    const container = chartContainerRef.current!;
    if (!overlayCanvasRef.current) {
      const c = document.createElement('canvas');
      c.dataset.zone = '1';
      c.style.position = 'absolute';
      c.style.pointerEvents = 'none';
      c.style.zIndex = '1';
      container.appendChild(c);
      overlayCanvasRef.current = c;
    }
    const paneCanvas = Array.from(container.querySelectorAll('canvas')).find(
      (el) => !(el as HTMLCanvasElement).dataset.zone
    ) as HTMLCanvasElement | undefined;
    if (!paneCanvas) return;
    const paneRect = paneCanvas.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    const left = paneRect.left - contRect.left;
    const top = paneRect.top - contRect.top;
    const w = Math.round(paneRect.width);
    const h = Math.round(paneRect.height);
    const canvas = overlayCanvasRef.current!;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

  const drawZonesOnCanvas = useCallback(() => {
    if (!chartRef.current || !candleSeriesRef.current) return;
    ensureOverlayCanvas();
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const ts = chartRef.current.timeScale();
    const data = dataRef.current;
    for (let i = 0; i < data.length - 1; i++) {
      const t1 = data[i].time as UTCTimestamp;
      const t2 = data[i + 1].time as UTCTimestamp;
      const x1 = ts.timeToCoordinate(t1 as any);
      const x2 = ts.timeToCoordinate(t2 as any);
      if (x1 == null || x2 == null) continue;

      const su = supUpperMapRef.current.get(t1);
      const sl = supLowerMapRef.current.get(t1);
      if (su != null && sl != null) {
        const yU = candleSeriesRef.current.priceToCoordinate(su);
        const yL = candleSeriesRef.current.priceToCoordinate(sl);
        if (yU != null && yL != null) {
          const left = Math.min(x1, x2);
          const width = Math.abs(x2 - x1);
          const top = Math.min(yU, yL);
          const height = Math.abs(yL - yU);
          if (width > 0 && height > 0) {
            ctx.fillStyle = 'rgba(46,125,50,0.22)';
            ctx.fillRect(left, top, width, height);
          }
        }
      }

      const ru = resUpperMapRef.current.get(t1);
      const rl = resLowerMapRef.current.get(t1);
      if (ru != null && rl != null) {
        const yU = candleSeriesRef.current.priceToCoordinate(ru);
        const yL = candleSeriesRef.current.priceToCoordinate(rl);
        if (yU != null && yL != null) {
          const left = Math.min(x1, x2);
          const width = Math.abs(x2 - x1);
          const top = Math.min(yU, yL);
          const height = Math.abs(yL - yU);
          if (width > 0 && height > 0) {
            ctx.fillStyle = 'rgba(244,67,54,0.22)';
            ctx.fillRect(left, top, width, height);
          }
        }
      }
    }
  }, [ensureOverlayCanvas]);

  const scheduleDraw = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawZonesOnCanvas);
  }, [drawZonesOnCanvas]);

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const chartOptions: DeepPartial<ChartOptions> = {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: { background: { color: '#ffffff' }, textColor: '#333' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      crosshair: { mode: 0 },
      timeScale: {
        borderColor: '#ccc',
        timeVisible: true,
        tickMarkFormatter: (timestamp: any) =>
          dayjs.unix(timestamp).tz(TimeZone.NEW_YORK).format('MM-DD HH:mm')
      },
      rightPriceScale: { borderColor: '#ccc' },
      watermark: { visible: false }
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    chart.applyOptions({
      localization: {
        timeFormatter: (time: any) => {
          const ts =
            typeof time === 'number'
              ? time
              : dayjs(`${time.year}-${time.month}-${time.day}`).unix();
          return dayjs
            .unix(ts)
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
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addHistogramSeries({
      color: '#8884d8',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume'
    });
    volumeSeriesRef.current = volumeSeries;

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }
    });

    smaVolumeSeriesRef.current = chart.addLineSeries({
      color: '#fbc02d',
      lineWidth: 2,
      priceScaleId: 'volume',
      lastValueVisible: false,
      priceLineVisible: false
    });

    sma20VolumeSeriesRef.current = chart.addLineSeries({
      color: '#2196f3',
      lineWidth: 2,
      priceScaleId: 'volume',
      lastValueVisible: false,
      priceLineVisible: false
    });

    chart.applyOptions({
      rightPriceScale: {
        borderColor: '#ccc',
        scaleMargins: { top: 0.05, bottom: 0.45 }
      }
    });

    tenkan135SeriesRef.current = chart.addLineSeries({
      color: '#ff9800',
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      priceScaleId: 'right',
      lastValueVisible: false,
      priceLineVisible: false
    });

    rsi3SeriesRef.current = chart.addLineSeries({
      color: '#9c27b0',
      lineWidth: 1,
      priceScaleId: 'rsi',
      lastValueVisible: false,
      priceLineVisible: false
    });

    rsi5SeriesRef.current = chart.addLineSeries({
      color: '#00bcd4',
      lineWidth: 1,
      priceScaleId: 'rsi',
      lastValueVisible: false,
      priceLineVisible: false
    });

    chart.priceScale('rsi').applyOptions({
      scaleMargins: { top: 0.6, bottom: 0.2 }
    });

    chart.subscribeClick((param) => {
      if (tooltipVisibleRef.current) {
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        tooltipVisibleRef.current = false;
        return;
      }

      if (
        !param ||
        !param.time ||
        !param.seriesData.size ||
        !candleSeriesRef.current
      )
        return;

      const candle = param.seriesData.get(
        candleSeriesRef.current
      ) as CandlestickData;
      const volumeItem = dataRef.current.find((d) => d.time === param.time);
      if (!candle || !volumeItem) return;

      const idx = dataRef.current.findIndex((d) => d.time === param.time);
      const prev = idx > 0 ? dataRef.current[idx - 1] : undefined;

      const percentChange =
        prev && prev.close
          ? ((candle.close - prev.close) / prev.close) * 100
          : null;

      const rsi3Point =
        rsi3SeriesRef.current &&
        (param.seriesData.get(rsi3SeriesRef.current) as
          | LineData<UTCTimestamp>
          | undefined);
      const rsi5Point =
        rsi5SeriesRef.current &&
        (param.seriesData.get(rsi5SeriesRef.current) as
          | LineData<UTCTimestamp>
          | undefined);

      const rsi3Val =
        rsi3Point && typeof rsi3Point.value === 'number'
          ? rsi3Point.value
          : undefined;
      const rsi5Val =
        rsi5Point && typeof rsi5Point.value === 'number'
          ? rsi5Point.value
          : undefined;

      const fmt = (v?: number) =>
        typeof v === 'number' && isFinite(v) ? v.toFixed(2) : 'N/A';

      const formattedPercent = formatPercent(percentChange);
      const closeChangeColor =
        percentChange !== null
          ? percentChange >= 0
            ? 'var(--positive-color)'
            : 'var(--negative-color)'
          : 'var(--black-color)';

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
      }<br/>
        <strong>RSI(3): </strong>${fmt(rsi3Val)}<br/>
        <strong>RSI(5): </strong>${fmt(rsi5Val)}
      `;

      tooltipVisibleRef.current = true;
    });

    const ro = new ResizeObserver(() => {
      if (!chartContainerRef.current) return;
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      scheduleDraw();
      requestAnimationFrame(scheduleDraw);
    });

    ro.observe(chartContainerRef.current);
    chart.timeScale().subscribeVisibleTimeRangeChange(scheduleDraw);

    return () => {
      ro.disconnect();
      chart.remove();
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.remove();
        overlayCanvasRef.current = null;
      }
    };
  }, [scheduleDraw]);

  useEffect(() => {
    dataRef.current = candlestickData;
    if (!chartRef.current || !candleSeriesRef.current) return;

    candleSeriesRef.current.setData(candlestickData);

    const { hi: hi50, lo: lo50 } = getRollingHiLoSeries(
      candlestickData,
      selectedPeriod === '15M' ? 200 : 50
    );
    const resUpper = hi50;
    const resLower = hi50.map(({ time, value }) => ({
      time,
      value: (value as number) - 1
    }));
    const supLower = lo50;
    const supUpper = lo50.map(({ time, value }) => ({
      time,
      value: (value as number) + 1
    }));

    supLowerMapRef.current = new Map(
      supLower.map((d) => [d.time, d.value as number])
    );
    supUpperMapRef.current = new Map(
      supUpper.map((d) => [d.time, d.value as number])
    );
    resUpperMapRef.current = new Map(
      resUpper.map((d) => [d.time, d.value as number])
    );
    resLowerMapRef.current = new Map(
      resLower.map((d) => [d.time, d.value as number])
    );

    if (supportLineRef.current) {
      candleSeriesRef.current.removePriceLine(supportLineRef.current);
      supportLineRef.current = null;
    }
    if (resistanceLineRef.current) {
      candleSeriesRef.current.removePriceLine(resistanceLineRef.current);
      resistanceLineRef.current = null;
    }

    if (resUpper.length) {
      resistanceLineRef.current = candleSeriesRef.current.createPriceLine({
        price: resUpper[resUpper.length - 1].value as number,
        color: '#ff4800',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: 'Resistance'
      });
    }
    if (supLower.length) {
      supportLineRef.current = candleSeriesRef.current.createPriceLine({
        price: supLower[supLower.length - 1].value as number,
        color: '#2e7d32',
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: 'Support'
      });
    }

    const volumeData: HistogramData<UTCTimestamp>[] = candlestickData.map(
      (d) => ({
        time: d.time as UTCTimestamp,
        value: d.volume ?? 0,
        color: d.close > d.open ? '#26a69a' : '#ef5350'
      })
    );
    volumeSeriesRef.current?.setData(volumeData);

    const smaVolumeData: LineData<UTCTimestamp>[] = candlestickData
      .filter((d) => typeof d.sma_volume === 'number')
      .map((d) => ({
        time: d.time as UTCTimestamp,
        value: d.sma_volume as number
      }));
    smaVolumeSeriesRef.current?.setData(smaVolumeData);

    const volumes = candlestickData.map((d) => d.volume ?? 0);
    const sma20Values = calculateSMA(volumes, 20);
    const sma20VolumeData: LineData<UTCTimestamp>[] = candlestickData
      .map((d, i) => ({
        time: d.time as UTCTimestamp,
        value: sma20Values[i] as number
      }))
      .filter((d) => Number.isFinite(d.value));
    sma20VolumeSeriesRef.current?.setData(sma20VolumeData);

    const closes = candlestickData.map((d) => d.close);
    const rsi3 = calculateRSI(closes, 3);
    const rsi5 = calculateRSI(closes, 5);

    const rsi3Data: LineData<UTCTimestamp>[] = candlestickData
      .map((d, i) =>
        rsi3[i] !== undefined
          ? { time: d.time as UTCTimestamp, value: rsi3[i]! }
          : null
      )
      .filter((x): x is LineData<UTCTimestamp> => !!x);
    const rsi5Data: LineData<UTCTimestamp>[] = candlestickData
      .map((d, i) =>
        rsi5[i] !== undefined
          ? { time: d.time as UTCTimestamp, value: rsi5[i]! }
          : null
      )
      .filter((x): x is LineData<UTCTimestamp> => !!x);

    rsi3SeriesRef.current?.setData(rsi3Data);
    rsi5SeriesRef.current?.setData(rsi5Data);

    const tenkan = calculateTenkan(candlestickData, 135);
    const tenkanData: LineData<UTCTimestamp>[] = candlestickData
      .map((d, i) =>
        Number.isFinite(tenkan[i])
          ? { time: d.time as UTCTimestamp, value: tenkan[i]! }
          : null
      )
      .filter((x): x is LineData<UTCTimestamp> => !!x);
    tenkan135SeriesRef.current?.setData(tenkanData);

    scheduleDraw();
    requestAnimationFrame(scheduleDraw);

    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
      tooltipVisibleRef.current = false;
    }

    const hasExit = exitPrice !== undefined && exitDate;
    const isProfit = hasExit ? exitPrice! >= entryPrice : false;
    const markers: SeriesMarker<any>[] = [];
    try {
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
      candleSeriesRef.current.setMarkers(markers);
    } catch {}
  }, [
    selectedPeriod,
    candlestickData,
    entryPrice,
    entryDate,
    exitPrice,
    exitDate,
    parseToUnixTime,
    scheduleDraw
  ]);

  return (
    <Spin spinning={loading}>
      <div css={styles.selectWrapper}>
        <Select
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          css={styles.selectPeriod}
          options={periodOptions.map((p) => ({ value: p, label: `${p}` }))}
          size='small'
        />
      </div>

      <div ref={chartContainerRef} css={styles.chartContainer}>
        <div ref={tooltipRef} css={styles.tooltip} />
        {!loading && candlestickData.length === 0 && (
          <div css={styles.emptyOverlay}>
            <Empty />
          </div>
        )}
      </div>
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
  emptyOverlay: css`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
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
    z-index: 2;
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
