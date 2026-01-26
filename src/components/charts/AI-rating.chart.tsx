import * as echarts from 'echarts';
import { useEffect, useRef } from 'react';

enum Recommendation {
  STRONG_SELL = 'Strong Sell',
  SELL = 'Sell',
  HOLD = 'Hold',
  BUY = 'Buy',
  STRONG_BUY = 'Strong Buy'
}

type AIRatingProps = {
  rating: number;
};

const getRecommendation = (rating: number): Recommendation => {
  if (rating > 90) return Recommendation.STRONG_BUY;
  if (rating > 70) return Recommendation.BUY;
  if (rating > 40) return Recommendation.HOLD;
  if (rating > 20) return Recommendation.SELL;
  return Recommendation.STRONG_SELL;
};

const getRecommendationColor = (recommendation: Recommendation): string => {
  const colorMap = {
    [Recommendation.STRONG_BUY]: '#7CFFB2',
    [Recommendation.BUY]: '#58D9F9',
    [Recommendation.HOLD]: '#FDDD60',
    [Recommendation.SELL]: '#FFA07A',
    [Recommendation.STRONG_SELL]: '#FF6E76'
  };
  return colorMap[recommendation];
};

export default function AIRatingChart({ rating }: AIRatingProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const recommendation = getRecommendation(rating);
  const recommendationColor = getRecommendationColor(recommendation);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    const calculateLayout = () => {
      const containerWidth = chartRef.current?.clientWidth || 300;
      const isSmallScreen = containerWidth < 350;

      return {
        radius: '90%',
        center: ['50%', '60%'],
        detailFontSize: isSmallScreen ? 20 : 26,
        axisLabelFontSize: isSmallScreen ? 10 : 12,
        titleFontSize: isSmallScreen ? 16 : 18,
        pointerLength: isSmallScreen ? '10%' : '12%'
      };
    };

    const updateChart = () => {
      const layout = calculateLayout();

      const option = {
        grid: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
          containLabel: false
        },
        series: [
          {
            type: 'gauge',
            startAngle: 210,
            endAngle: -30,
            center: layout.center,
            radius: layout.radius,
            min: 0,
            max: 100,
            splitNumber: 10,
            axisLine: {
              lineStyle: {
                width: 8,
                color: [
                  [0.2, '#FF6E76'], // 0-20: STRONG_SELL
                  [0.4, '#FFA07A'], // 20-40: SELL
                  [0.7, '#FDDD60'], // 40-70: HOLD
                  [0.8, '#58D9F9'], // 70-90: BUY
                  [1, '#7CFFB2'] // 90-100: STRONG_BUY
                ]
              }
            },
            pointer: {
              icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
              length: layout.pointerLength,
              width: 18,
              offsetCenter: [0, '-50%'],
              itemStyle: {
                color: recommendationColor
              }
            },
            axisTick: {
              length: 8,
              lineStyle: {
                color: 'auto',
                width: 2
              },
              splitNumber: 10
            },
            splitLine: {
              length: 12,
              lineStyle: {
                color: 'auto',
                width: 4
              },
              splitNumber: 10
            },
            axisLabel: {
              color: '#464646',
              fontSize: layout.axisLabelFontSize,
              distance: -32,
              rotate: 'tangential',
              formatter: function (value: number) {
                return value % 10 === 0 ? value : '';
              }
            },
            title: {
              show: false
            },
            detail: {
              fontSize: layout.detailFontSize,
              offsetCenter: [0, '-20%'],
              valueAnimation: true,
              formatter: `{value}\n{name|${recommendation.toUpperCase()}}`,
              color: recommendationColor,
              fontWeight: 'bold',
              rich: {
                name: {
                  fontSize: layout.titleFontSize,
                  lineHeight: 20,
                  color: recommendationColor,
                  padding: [20, 0, 0, 0]
                }
              }
            },
            data: [
              {
                value: rating
              }
            ]
          }
        ]
      };

      chart.setOption(option, true);
    };

    updateChart();

    const handleResize = () => {
      updateChart();
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [rating, recommendation, recommendationColor]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '200px',
        minWidth: '220px',
        margin: '0 auto',
        padding: 0
      }}
    />
  );
}
