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
  const option = {
    legend: {
      orient: 'horizontal',
      left: 0,
      bottom: 0,
      itemGap: 16,
      textStyle: { color: '#1e1e1e' }
    },
    dataset: {
      source: data
    },
    xAxis: {
      type: 'category',
      axisLabel: { color: '#1e1e1e' }
    },
    yAxis: {
      axisLabel: { color: '#1e1e1e' }
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
        notMerge={true}
        lazyUpdate={true}
      />
    )
  );
}
