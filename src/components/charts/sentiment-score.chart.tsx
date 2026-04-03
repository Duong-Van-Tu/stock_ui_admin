/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { getTextColor } from '@/utils/common';
import { useEChartsTheme } from './echarts-theme';

type SentimentSCoreProps = {
  score: number;
};

export const SentimentSCore = ({ score }: SentimentSCoreProps) => {
  const clamped = Math.max(-10, Math.min(10, score));
  const displayValue = String(score);
  const chartTheme = useEChartsTheme();

  const option: EChartsOption = {
    animation: true,
    animationDuration: 600,
    tooltip: { show: false },
    grid: { top: 0, bottom: 0, left: 0, right: 0 },
    series: [
      {
        type: 'gauge',
        min: -10,
        max: 10,
        startAngle: 90,
        endAngle: -270,
        clockwise: false,
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 3,
            color: [
              [0.25, '#d73027'],
              [0.5, '#fc8d59'],
              [0.75, '#91cf60'],
              [1, '#1a9850']
            ]
          }
        },
        progress: { show: false },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        anchor: { show: false },
        detail: {
          show: true,
          formatter: () => displayValue,
          color: getTextColor(clamped),
          fontSize: 13,
          offsetCenter: [0, 0]
        },
        data: [{ value: clamped }]
      }
    ]
  };

  return (
    <div css={container}>
      <div css={chartWrapper}>
        <ReactECharts
          key={chartTheme.backgroundColor}
          option={option}
          notMerge
          style={{ width: '100%', height: '100%' }}
          onChartReady={(chart) => chart.getZr().setCursorStyle('pointer')}
        />
      </div>
    </div>
  );
};

const container = css`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  canvas {
    cursor: pointer;
  }
`;

const chartWrapper = css`
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease, filter 0.2s ease;
  &:hover {
    transform: scale(1.05);
    filter: brightness(1.15);
  }
`;
