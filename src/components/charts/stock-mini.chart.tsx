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
  width = 140,
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

    const open = data[0].value;

    const applyMargins = (series: ReturnType<typeof chart.addAreaSeries>) => {
      series.priceScale().applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.1
        }
      });
    };

    const segments: { data: DataPoint[]; isDown: boolean }[] = [];
    let currentSegment: DataPoint[] = [];
    let prevValue = data[0].value;
    let currentIsDown = prevValue < open;

    for (let i = 0; i < data.length; i++) {
      const point = data[i];
      const isDown = point.value < open;

      if (i === 0 || isDown !== currentIsDown) {
        if (i > 0) {
          const crossoverTime = (point.time as number) - 1;
          const crossoverValue = open;

          currentSegment.push({
            time: crossoverTime as Time,
            value: crossoverValue
          });

          segments.push({
            data: [...currentSegment],
            isDown: currentIsDown
          });

          currentSegment = [
            {
              time: crossoverTime as Time,
              value: crossoverValue
            }
          ];
        }

        currentIsDown = isDown;
      }

      currentSegment.push(point);
      prevValue = point.value;
    }

    if (currentSegment.length > 0) {
      segments.push({
        data: currentSegment,
        isDown: currentIsDown
      });
    }

    segments.forEach(({ data: segment, isDown }) => {
      const lineColor = isDown ? '#fa080c' : '#10ba08';
      const topColor = isDown
        ? 'rgba(227, 1, 5, 0.4)'
        : 'rgba(4, 193, 120, 0.4)';
      const bottomColor = isDown
        ? 'rgba(255, 77, 79, 0)'
        : 'rgba(14, 203, 129, 0)';

      const series = chart.addAreaSeries({
        lineColor,
        topColor,
        bottomColor,
        lineWidth: 2,
        priceLineVisible: false
      });

      series.setData(segment);
      applyMargins(series);
    });

    chart
      .addLineSeries({
        color: '#999',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false
      })
      .setData(data.map((d) => ({ time: d.time, value: open })));

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
