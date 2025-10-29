import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getLatestHitOnePercent,
  watchLatestHitOnePercent
} from '@/redux/slices/signals.slice';
import { memo, useEffect, useMemo, useRef } from 'react';

function LatestHitOnePercentTickerTape() {
  const dispatch = useAppDispatch();
  const container = useRef<HTMLDivElement>(null);

  const LatestHitOnePercent = useAppSelector(watchLatestHitOnePercent);

  const symbols = useMemo(
    () =>
      LatestHitOnePercent.map((item) => ({
        proName: item.tickerName.trim()
      })),
    [LatestHitOnePercent]
  );

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    el.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    el.appendChild(widget);

    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;

    script.innerHTML = JSON.stringify(
      {
        symbols,
        colorTheme: 'light',
        locale: 'en',
        largeChartUrl: '',
        isTransparent: false,
        showSymbolLogo: true,
        displayMode: 'adaptive'
      },
      null,
      2
    );

    el.appendChild(script);

    return () => {
      el.innerHTML = '';
    };
  }, [symbols]);

  useEffect(() => {
    dispatch(getLatestHitOnePercent());
  }, [dispatch]);

  return <div className='tradingview-widget-container' ref={container} />;
}

export default memo(LatestHitOnePercentTickerTape);
