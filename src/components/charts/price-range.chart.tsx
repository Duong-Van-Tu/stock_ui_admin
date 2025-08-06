import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { roundToDecimals } from '@/utils/common';

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

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    chart.setOption({
      xAxis: {
        type: 'value',
        min: lowest,
        max: highest,
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
            [lowest, 0],
            [highest, 0]
          ],
          lineStyle: {
            color: '#444',
            width: 3
          },
          showSymbol: false,
          z: 1
        },

        {
          type: 'line',
          data: [
            [lowest, 0],
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
            text: roundToDecimals(lowest),
            fill: '#000',
            font: '12px sans-serif'
          }
        },
        {
          type: 'text',
          right: '0%',
          top: 'bottom',
          style: {
            text: roundToDecimals(highest),
            fill: '#000',
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
  }, [lowest, highest, current]);

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
