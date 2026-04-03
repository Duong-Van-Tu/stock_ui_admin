/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import * as echarts from 'echarts/core';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { BarChart as BarEChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useEChartsTheme } from './echarts-theme';

echarts.use([
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  BarEChart,
  CanvasRenderer
]);

type BarChartProps = {
  data: any[];
  series: SeriesItem[];
  grid?: GridConfig;
  height?: string | number;
  width?: string | number;
};

export default function BarChart({
  data,
  series,
  grid,
  height,
  width
}: BarChartProps) {
  const [isChartReady, setIsChartReady] = useState(false);
  const chartTheme = useEChartsTheme();

  const selected: Record<string, boolean> = {};
  series.forEach((s) => {
    selected[s.name] = s.enabled !== false;
  });

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: chartTheme.tooltipBackgroundColor,
      borderColor: chartTheme.tooltipBorderColor,
      textStyle: {
        color: chartTheme.tooltipTextColor
      }
    },
    legend: {
      orient: 'horizontal',
      left: 0,
      bottom: 0,
      itemGap: 16,
      textStyle: { color: chartTheme.secondaryTextColor },
      selected
    },
    dataset: {
      source: data
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        color: chartTheme.secondaryTextColor,
        formatter: (value: string) => {
          if (/^\d{4}$/.test(value)) return value;
          return dayjs(value).isValid()
            ? dayjs(value).format('MM-DD-YYYY')
            : value;
        },
        hideOverlap: true
      },
      axisLine: {
        lineStyle: {
          color: chartTheme.axisLineColor
        }
      }
    },
    yAxis: {
      axisLabel: { color: chartTheme.secondaryTextColor },
      axisLine: { lineStyle: { color: chartTheme.axisLineColor } },
      splitLine: { lineStyle: { color: chartTheme.splitLineColor } }
    },
    grid: {
      top: 20,
      left: 20,
      right: 0,
      ...grid
    },
    series: series.map((item) => ({
      type: 'bar',
      name: item.name,
      color: item.color
    }))
  };

  const chartStyle = css`
    width: ${typeof width === 'number'
      ? `${width}px`
      : width || '100%'} !important;
    height: ${typeof height === 'number'
      ? `${height}px`
      : height || '100%'} !important;
  `;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    isChartReady && (
      <ReactEChartsCore
        css={chartStyle}
        echarts={echarts}
        option={option}
        key={chartTheme.backgroundColor}
        notMerge={true}
        lazyUpdate={true}
      />
    )
  );
}
