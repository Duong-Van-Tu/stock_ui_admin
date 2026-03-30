'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, memo } from 'react';
import { TimeZone } from '@/constants/timezone.constant';
import { useThemeMode } from '@/providers/theme.provider';
import { isMobile } from 'react-device-detect';

interface StockChartOverviewProps {
  symbol: string;
}

const StockChartOverview = ({ symbol }: StockChartOverviewProps) => {
  const { isDarkMode } = useThemeMode();
  const container = useRef<HTMLDivElement>(null);
  const chartTheme = isDarkMode ? 'dark' : 'light';
  const widgetBackgroundColor = isDarkMode
    ? 'var(--surface-elevated-color)'
    : '#ffffff';

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
          "theme": "${chartTheme}",
          "style": "1.5",
          "locale": "en",
          "allow_symbol_change": true,
          "studies": [],  
          "hide_side_toolbar": ${isMobile ? 'true' : 'false'},
          "hide_top_toolbar": false,
          "withdateranges": true,
          "details": false,
          "hide_legend": false,
          "container_id": "tradingview_advanced_chart"
        }`;
      container.current.appendChild(script);
    }
  }, [symbol, chartTheme]);

  return (
    <div
      className='tradingview-widget-container'
      ref={container}
      style={{ height: '100%', width: '100%', minHeight: '450px' }}
      css={css`
        background: ${widgetBackgroundColor};
        border-radius: 0.8rem;
        overflow: hidden;

        > div,
        iframe,
        .tradingview-widget-container__widget,
        .tradingview-widget-container__widget iframe {
          background: ${widgetBackgroundColor} !important;
        }
      `}
    >
      <div
        className='tradingview-widget-container__widget'
        style={{ height: '100%', width: '100%' }}
      ></div>
    </div>
  );
};

export default memo(StockChartOverview);
