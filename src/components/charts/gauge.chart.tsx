/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import * as echarts from 'echarts/core';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { GaugeChart as GaugeEChart } from 'echarts/charts';
import { TooltipComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, GaugeEChart, CanvasRenderer]);

type GaugeChartProps = {
  value: number;
  label: string;
};

export default function GaugeChart({ value, label }: GaugeChartProps) {
  const getValueColor = (value: number) => {
    if (value < 4) return '#d32f2f';
    if (value < 7) return '#FFBF00';
    return '#2e7d32';
  };

  const option = {
    series: [
      {
        type: 'gauge',
        center: ['50%', '65%'],
        radius: '90%',
        min: 0,
        max: 10,
        splitNumber: 10,
        startAngle: 180,
        endAngle: 0,
        axisLine: {
          show: false,
          lineStyle: {
            width: 1,
            color: [[1, 'rgba(0,0,0,0)']]
          }
        },
        axisLabel: {
          show: true,
          color: '#1e1e1e',
          fontSize: 14,
          distance: -20,
          formatter: function (v: number) {
            return v;
          }
        },
        axisTick: {
          show: true,
          splitNumber: 5,
          lineStyle: {
            color: '#263b35',
            width: 0.8
          },
          length: -6
        },
        splitLine: {
          show: true,
          length: -6,
          lineStyle: {
            color: '#4aca96',
            width: 2
          }
        }
      },
      {
        type: 'gauge',
        radius: '80%',
        center: ['50%', '65%'],
        splitNumber: 0,
        startAngle: 180,
        endAngle: 0,
        axisLine: {
          show: true,
          lineStyle: {
            width: 6,
            color: [
              [0.4, '#d32f2f'],
              [0.7, '#FFBF00'],
              [1, '#2e7d32']
            ]
          }
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        pointer: {
          show: false
        },
        title: {
          show: true,
          offsetCenter: [0, '30%'],
          textStyle: {
            fontWeight: 'bold',
            color: '#1e1e1e',
            fontSize: 16
          }
        },
        detail: {
          show: true,
          valueAnimation: true,
          offsetCenter: [0, '-20%'],
          color: getValueColor(value),
          textStyle: {
            fontSize: 30,
            color: getValueColor(value)
          }
        },
        data: [{ value, name: label }]
      },
      {
        type: 'gauge',
        radius: '70%',
        center: ['50%', '65%'],
        min: 0,
        max: 10,
        startAngle: 180,
        endAngle: 0,
        progress: {
          show: true,
          width: 20
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [value / 10, getValueColor(value)],
              [1, 'rgba(255, 255, 255, 0.2)']
            ]
          }
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        pointer: {
          show: false
        },
        detail: {
          show: false
        }
      }
    ]
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge={true}
      lazyUpdate={true}
      theme={'theme_name'}
      opts={{}}
      css={chartContainerStyles}
    />
  );
}

const chartContainerStyles = css`
  max-width: 25rem;
  width: 100%;
  max-height: 20rem;
  height: 100%;
  padding: 0 1rem;
  canvas {
    width: 100% !important;
    height: 100% !important;
  }
`;
