import { useEffect, useRef, memo } from 'react';
import { useLocale } from 'next-intl';

interface StockChartOverviewProps {
  symbol: string;
}

const StockChartOverview = ({ symbol }: StockChartOverviewProps) => {
  const container = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  useEffect(() => {
    if (container.current) {
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
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1.5",
          "locale": "${locale}",
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
  }, [symbol, locale]);

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
