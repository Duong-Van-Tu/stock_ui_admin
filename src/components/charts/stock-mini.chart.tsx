/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { createChart, LineStyle, Time } from 'lightweight-charts';

export type DataPoint = {
  time: Time;
  value: number;
};

type StockMiniChartProps = {
  data: DataPoint[];
  width?: number;
  height?: number;
};

export default function StockMiniChart({
  data,
  width = 138,
  height = 40
}: StockMiniChartProps) {
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
        priceLineVisible: false
      });

      const greenSeries = chart.addAreaSeries({
        lineColor: '#0ecb81',
        topColor: 'rgba(14, 203, 129, 0.4)',
        bottomColor: 'rgba(14, 203, 129, 0)',
        lineWidth: 2,
        priceLineVisible: true
      });

      const redData = data.slice(0, splitIndex + 1);
      const greenData = data.slice(splitIndex);

      redSeries.setData(redData);
      greenSeries.setData(greenData);
      applyMargins(redSeries);
      applyMargins(greenSeries);

      const open = data[0].value;
      redSeries.createPriceLine({
        price: open,
        color: '#999',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: false,
        title: 'Open'
      });
    }

    const times = data.map((d) => d.time as number);
    chart.timeScale().setVisibleRange({
      from: Math.min(...times) as Time,
      to: Math.max(...times) as Time
    });

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data]);

  return (
    <div
      css={css`
        width: ${width}px;
        height: ${height}px;
        margin-top: 2px;
        background-color: transparent;
        transition: background-color 0.3s;

        #tv-attr-logo {
          display: none;
        }

        &:hover {
          background-color: var(--background-Row-table-color);
        }
      `}
      ref={chartContainerRef}
    />
  );
}
