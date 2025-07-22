/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { createChart, Time } from 'lightweight-charts';

type DataPoint = {
  time: Time;
  value: number;
};

type StockMiniChartProps = {
  data: DataPoint[];
};

export default function StockMiniChart({ data }: StockMiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: 180,
      height: 60,
      layout: {
        background: { color: '#f5f5f5' },
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
      }
    });

    const chartElement =
      chartContainerRef.current.querySelector('canvas')?.parentElement;
    if (chartElement) {
      chartElement.addEventListener('wheel', (e) => e.preventDefault(), {
        passive: false
      });
      chartElement.addEventListener('touchstart', (e) => e.preventDefault(), {
        passive: false
      });
      chartElement.addEventListener('touchmove', (e) => e.preventDefault(), {
        passive: false
      });
    }

    const basePrice = data[0].value;
    const splitIndex = data.findIndex((d) => d.value > basePrice);

    if (splitIndex === -1 || splitIndex === 0) {
      const redSeries = chart.addAreaSeries({
        lineColor: '#ff4d4f',
        topColor: 'rgba(255, 77, 79, 0.4)',
        bottomColor: 'rgba(255, 77, 79, 0)',
        lineWidth: 2
      });
      redSeries.setData(data);
    } else {
      const redSeries = chart.addAreaSeries({
        lineColor: '#ff4d4f',
        topColor: 'rgba(255, 77, 79, 0.4)',
        bottomColor: 'rgba(255, 77, 79, 0)',
        lineWidth: 2
      });

      const greenSeries = chart.addAreaSeries({
        lineColor: '#0ecb81',
        topColor: 'rgba(14, 203, 129, 0.4)',
        bottomColor: 'rgba(14, 203, 129, 0)',
        lineWidth: 2
      });

      redSeries.setData(data.slice(0, splitIndex + 1));
      greenSeries.setData(data.slice(splitIndex));
    }

    return () => {
      chart.remove();
    };
  }, [data]);

  return (
    <div
      css={css`
        #tv-attr-logo {
          display: none;
        }
      `}
      ref={chartContainerRef}
    />
  );
}
