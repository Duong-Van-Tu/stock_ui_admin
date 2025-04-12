/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import * as echarts from 'echarts/core';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { LineChart as LineEChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useEffect, useState } from 'react';
import { useWindowSize } from '@/hooks/useWindowSize';

echarts.use([
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  LineEChart,
  CanvasRenderer
]);

interface SeriesItem {
  name: string;
  color: string;
}

interface LineChartProps {
  data: any[];
  series: SeriesItem[];
}

export default function LineChart({ data, series }: LineChartProps) {
  const { width } = useWindowSize();
  const [isChartReady, setIsChartReady] = useState(false);

  const maxSeriesPerRow = 4;
  const legendRowCount = Math.ceil(series.length / maxSeriesPerRow);
  const gridBottom = width <= 820 && legendRowCount >= 3 ? '25%' : '15%';

  const option = {
    legend: {
      orient: 'horizontal',
      left: 10,
      bottom: 0,
      itemGap: 16,
      textStyle: { color: '#333' }
    },
    tooltip: {
      trigger: 'axis'
    },
    dataset: {
      source: data
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLabel: { color: '#333' },
      axisLine: { lineStyle: { color: '#ccc' } }
    },
    yAxis: {
      axisLabel: { color: '#333' },
      axisLine: { lineStyle: { color: '#ccc' } },
      splitLine: { lineStyle: { color: '#e0e0e0' } }
    },
    grid: {
      left: '10px',
      right: '10px',
      bottom: gridBottom,
      containLabel: true
    },
    series: series.map((item) => ({
      type: 'line',
      name: item.name,
      color: item.color,
      smooth: true,
      showSymbol: false
    }))
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    isChartReady && (
      <ReactEChartsCore
        css={rootStyle}
        echarts={echarts}
        option={option}
        notMerge={true}
        lazyUpdate={true}
      />
    )
  );
}

const rootStyle = css`
  width: 100%;
  height: 100%;
`;
