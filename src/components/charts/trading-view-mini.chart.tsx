/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, memo } from 'react';

type ChartMiniTradingviewProps = {
  symbol: string;
  width?: string | number;
  height?: string | number;
  colorTheme?: 'light' | 'dark';
  locale?: string;
};

const ChartMiniTradingview = ({
  symbol,
  width = '100%',
  height = 180,
  colorTheme = 'light',
  locale = 'en'
}: ChartMiniTradingviewProps) => {
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
      css={css`
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0.7rem;
          right: 0.6rem;
          width: 3.2rem;
          height: 2.6rem;
          background: var(--white-color);
          box-shadow: 0 2px 4px 0 var(--white-color);
        }
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          z-index: 10;
          pointer-events: all;
        }
      `}
    />
  );
};

export default memo(ChartMiniTradingview);
