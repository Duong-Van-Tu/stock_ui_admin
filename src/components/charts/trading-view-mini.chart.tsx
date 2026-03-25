/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useEffect, useRef, memo } from 'react';
import { useThemeMode } from '@/providers/theme.provider';

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
  colorTheme,
  locale = 'en'
}: ChartMiniTradingviewProps) => {
  const { isDarkMode } = useThemeMode();
  const container = useRef<HTMLDivElement>(null);
  const resolvedColorTheme = colorTheme ?? (isDarkMode ? 'dark' : 'light');
  const widgetBackgroundColor =
    resolvedColorTheme === 'dark' ? '#1f1f1f' : 'var(--white-color)';

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
          "colorTheme": "${resolvedColorTheme}",
          "isTransparent": false,
          "autosize": false
        }`;

      container.current.appendChild(script);
    }
  }, [symbol, width, height, resolvedColorTheme, locale]);

  return (
    <div
      style={{ width, height }}
      css={css`
        position: relative;
        overflow: hidden;
        background: transparent;
        border-radius: 0.8rem;

        &::before {
          content: '';
          position: absolute;
          top: -1px;
          right: -1px;
          width: 5.2rem;
          height: 4.8rem;
          background: ${widgetBackgroundColor};
          border-top-right-radius: 0.8rem;
          border-bottom-left-radius: 1.2rem;
          z-index: 11;
        }
      `}
    >
      <div
        className='tradingview-widget-container'
        ref={container}
        css={css`
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 0.8rem;
          background: ${widgetBackgroundColor};

          > div,
          iframe,
          .tradingview-widget-container__widget,
          .tradingview-widget-container__widget iframe {
            border-radius: inherit !important;
            background: ${widgetBackgroundColor} !important;
          }

          &::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background:
              linear-gradient(
                to bottom,
                ${widgetBackgroundColor} 0,
                ${widgetBackgroundColor} 1px,
                transparent 1px
              ),
              linear-gradient(
                to top,
                ${widgetBackgroundColor} 0,
                ${widgetBackgroundColor} 1px,
                transparent 1px
              ),
              linear-gradient(
                to right,
                ${widgetBackgroundColor} 0,
                ${widgetBackgroundColor} 1px,
                transparent 1px
              ),
              linear-gradient(
                to left,
                ${widgetBackgroundColor} 0,
                ${widgetBackgroundColor} 1px,
                transparent 1px
              );
            background-repeat: no-repeat;
            background-size:
              100% 1px,
              100% 1px,
              1px 100%,
              1px 100%;
            background-position:
              top left,
              bottom left,
              top left,
              top right;
            pointer-events: none;
            z-index: 3;
          }
        `}
      />
      <div
        aria-hidden='true'
        css={css`
          position: absolute;
          inset: 0;
          z-index: 12;
          border-radius: 0.8rem;
          background: transparent;
          pointer-events: auto;
        `}
      />
    </div>
  );
};

export default memo(ChartMiniTradingview);
