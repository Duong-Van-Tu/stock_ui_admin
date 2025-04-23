import { useEffect, useRef, memo } from 'react';

interface MiniStockChartProps {
  symbol: string;
  width?: string | number;
  height?: string | number;
  colorTheme?: 'light' | 'dark';
  locale?: string;
}

const MiniStockChart = ({
  symbol,
  width = '100%',
  height = 200,
  colorTheme = 'light',
  locale = 'en'
}: MiniStockChartProps) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';

      const script = document.createElement('script');
      script.src =
        'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        {
          "symbol": "${symbol}",
          "width": "${width}",
          "height": "${height}",
          "locale": "${locale}",
          "dateRange": "3M",
          "colorTheme": "${colorTheme}",
          "isTransparent": true,
          "autosize": false
        }`;

      container.current.appendChild(script);
    }
  }, [symbol, width, height, colorTheme, locale]);

  return (
    <div
      className='tradingview-widget-container'
      ref={container}
      style={{ width, height }}
    />
  );
};

export default memo(MiniStockChart);
