import { useEffect, useRef, memo } from 'react';
import { TimeZone } from '@/constants/timezone.constant';

interface StockChartOverviewProps {
  symbol: string;
}

const StockChartOverview = ({ symbol }: StockChartOverviewProps) => {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
      const script = document.createElement('script');
      script.src =
        'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        {
          "autosize": true,
          "symbol": "${symbol}",
          "interval": "D",
           "timezone": "${TimeZone.NEW_YORK}",
          "theme": "light",
          "style": "1.5",
          "locale": "en",
          "allow_symbol_change": true,
          "studies": [],  
          "hide_side_toolbar": false,
          "hide_top_toolbar": false,
          "withdateranges": true,
          "details": false,
          "hide_legend": false,
          "container_id": "tradingview_advanced_chart"
        }`;
      container.current.appendChild(script);
    }
  }, [symbol]);

  return (
    <div
      className='tradingview-widget-container'
      ref={container}
      style={{ height: '100%', width: '100%' }}
    >
      <div
        className='tradingview-widget-container__widget'
        style={{ height: '100%', width: '100%' }}
      ></div>
    </div>
  );
};

export default memo(StockChartOverview);
