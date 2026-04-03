/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useRef } from 'react';
import { createChart, LineStyle, Time } from 'lightweight-charts';
import { useThemeMode } from '@/providers/theme.provider';

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
  const { isDarkMode } = useThemeMode();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart>>();

  const getMiniChartTheme = useCallback(() => {
    if (typeof window === 'undefined') {
      return {
        backgroundColor: '#ffffff',
        textColor: '#999999',
        baselineColor: '#999999'
      };
    }

    const rootStyle = window.getComputedStyle(document.documentElement);
    const getVar = (name: string, fallback: string) =>
      rootStyle.getPropertyValue(name).trim() || fallback;

    return {
      backgroundColor: getVar(
        '--surface-base-color',
        isDarkMode ? '#0f1722' : '#ffffff'
      ),
      textColor: getVar(
        '--text-tertiary-color',
        isDarkMode ? '#93a4b8' : '#999999'
      ),
      baselineColor: getVar(
        '--text-tertiary-color',
        isDarkMode ? '#93a4b8' : '#999999'
      )
    };
  }, [isDarkMode]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const container = chartContainerRef.current;
    const chartTheme = getMiniChartTheme();

    const chart = createChart(container, {
      layout: {
        background: { color: chartTheme.backgroundColor },
        textColor: chartTheme.textColor
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
    let currentIsDown = data[0].value < open;

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
        color: chartTheme.baselineColor,
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
  }, [data, getMiniChartTheme]);

  return (
    <div
      css={css`
        width: ${width}px;
        height: ${height}px;
        margin-top: 2px;
        background-color: var(--surface-base-color);
        border-radius: 4px;
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
