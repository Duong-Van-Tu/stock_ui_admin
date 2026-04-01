import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { roundToDecimals } from '@/utils/common';
import { useEChartsTheme } from './echarts-theme';

interface PriceRangeSliderProps {
  lowest: number;
  highest: number;
  current: number;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  lowest,
  highest,
  current
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartTheme = useEChartsTheme();

  const effectiveLowest = Math.min(lowest, current);
  const effectiveHighest = Math.max(highest, current);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.seriesType === 'scatter') {
            const price = params.value[0] as number;
            const delta = price - effectiveLowest;
            const pct =
              effectiveLowest === 0 ? 0 : (delta / effectiveLowest) * 100;
            if (delta <= 0) {
              return `${roundToDecimals(price)}`;
            }
            return `${roundToDecimals(price)} (+$${roundToDecimals(
              delta
            )}, +${roundToDecimals(pct)}%)`;
          }
          return '';
        },
        backgroundColor: chartTheme.tooltipBackgroundColor,
        borderColor: chartTheme.tooltipBorderColor,
        borderWidth: 1,
        padding: [1, 4],
        textStyle: {
          color: chartTheme.tooltipTextColor,
          fontSize: 12
        },
        position: (point: number[]) => [point[0] + 10, point[1] - 10]
      },
      xAxis: {
        type: 'value',
        min: effectiveLowest,
        max: effectiveHighest,
        show: false
      },
      yAxis: {
        type: 'value',
        min: -1,
        max: 1,
        show: false
      },
      series: [
        {
          type: 'line',
          data: [
            [effectiveLowest, 0],
            [effectiveHighest, 0]
          ],
          lineStyle: {
            color: chartTheme.axisLineColor,
            width: 3
          },
          showSymbol: false,
          z: 1
        },
        {
          type: 'line',
          data: [
            [effectiveLowest, 0],
            [current, 0]
          ],
          lineStyle: {
            color: '#90caf9',
            width: 3
          },
          showSymbol: false,
          z: 2
        },
        {
          type: 'scatter',
          data: [[current, 0]],
          symbol: 'pin',
          symbolSize: 20,
          itemStyle: {
            color: '#90caf9'
          },
          z: 3
        }
      ],
      grid: {
        top: 10,
        bottom: 10,
        left: 6,
        right: 6
      },
      graphic: [
        {
          type: 'text',
          left: '0%',
          top: 'bottom',
          style: {
            text: roundToDecimals(effectiveLowest),
            fill: chartTheme.secondaryTextColor,
            font: '12px sans-serif'
          }
        },
        {
          type: 'text',
          right: '0%',
          top: 'bottom',
          style: {
            text: roundToDecimals(effectiveHighest),
            fill: chartTheme.secondaryTextColor,
            font: '12px sans-serif'
          }
        }
      ]
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [chartTheme, current, effectiveHighest, effectiveLowest]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        aspectRatio: '5 / 1',
        minHeight: 40
      }}
    />
  );
};

export default PriceRangeSlider;
