/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { createChart, Time } from 'lightweight-charts';

export type DataPoint = {
  time: Time;
  value: number;
};

type StockMiniChartProps = {
  data: DataPoint[];
};

export default function StockMiniChart({ data }: StockMiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart>>();

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#999'
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false }
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false }
      },
      timeScale: {
        visible: false
      },
      rightPriceScale: {
        visible: false
      },
      handleScroll: false,
      handleScale: false
    });

    chartRef.current = chart;

    chart.resize(container.clientWidth, container.clientHeight);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.resize(width, height);
      }
    });

    resizeObserver.observe(container);

    const basePrice = data[0].value;
    const splitIndex = data.findIndex((d) => d.value > basePrice);

    const applyMargins = (series: ReturnType<typeof chart.addAreaSeries>) => {
      series.priceScale().applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.1
        }
      });
    };

    if (splitIndex === -1 || splitIndex === 0) {
      const redSeries = chart.addAreaSeries({
        lineColor: '#ff4d4f',
        topColor: 'rgba(255, 77, 79, 0.4)',
        bottomColor: 'rgba(255, 77, 79, 0)',
        lineWidth: 2,
        priceLineVisible: false
      });
      redSeries.setData(data);
      applyMargins(redSeries);
    } else {
      const redSeries = chart.addAreaSeries({
        lineColor: '#ff4d4f',
        topColor: 'rgba(255, 77, 79, 0.4)',
        bottomColor: 'rgba(255, 77, 79, 0)',
        lineWidth: 2,
        priceLineVisible: true
      });

      const greenSeries = chart.addAreaSeries({
        lineColor: '#0ecb81',
        topColor: 'rgba(14, 203, 129, 0.4)',
        bottomColor: 'rgba(14, 203, 129, 0)',
        lineWidth: 2,
        priceLineVisible: true
      });

      redSeries.setData(data.slice(0, splitIndex + 1));
      greenSeries.setData(data.slice(splitIndex));
      applyMargins(redSeries);
      applyMargins(greenSeries);
    }

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data]);

  return (
    <div
      css={css`
        width: 100%;
        height: 100%;
        margin-top: 2px;

        #tv-attr-logo {
          display: none;
        }

        background-color: transparent;
        transition: background-color 0.3s;

        &:hover {
          background-color: 'var(--background-Row-table-color)';
        }
      `}
      ref={chartContainerRef}
    />
  );
}
