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

echarts.use([
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  BarEChart,
  CanvasRenderer
]);

type SeriesItem = {
  name: string;
  color: string;
};

type BarChartProps = {
  data: any[];
  series: SeriesItem[];
};

export default function BarChart({ data, series }: BarChartProps) {
  const option = {
    legend: {
      orient: 'horizontal',
      left: 10,
      bottom: 0,
      itemGap: 16,
      textStyle: { color: '#1e1e1e' }
    },
    tooltip: {},
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
      top: '20px',
      left: '10px',
      right: '10px',
      bottom: '40px',
      containLabel: true
    },
    series: series.map((item) => ({
      type: 'bar',
      name: item.name,
      color: item.color
    }))
  };

  return (
    <ReactEChartsCore
      css={rootStyle}
      echarts={echarts}
      option={option}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}

const rootStyle = css`
  width: 100%;
  height: 100%;
`;
