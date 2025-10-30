/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getLatestHitOnePercent,
  watchLatestHitOnePercent
} from '@/redux/slices/signals.slice';
import { memo, useEffect, useMemo, useRef } from 'react';
import { appEnvs } from '@/utils/env-mapper';

type LatestHitOnePercentTickerTapeProps = {
  alertLogsFilter?: AlertLogsFilter;
};

function LatestHitOnePercentTickerTape({
  alertLogsFilter
}: LatestHitOnePercentTickerTapeProps) {
  const dispatch = useAppDispatch();
  const container = useRef<HTMLDivElement>(null);

  const latestHitOnePercent = useAppSelector(watchLatestHitOnePercent);

  const symbols = useMemo(
    () =>
      latestHitOnePercent.map((item) => ({
        proName: item.trim()
      })),
    [latestHitOnePercent]
  );

  const from = alertLogsFilter?.fromEntryDate ?? null;
  const to = alertLogsFilter?.toEntryDate ?? null;

  const fromKey = useMemo(
    () => (from ? new Date(from).toISOString() : null),
    [from]
  );
  const toKey = useMemo(() => (to ? new Date(to).toISOString() : null), [to]);

  useEffect(() => {
    if (!fromKey || !toKey) return;
    dispatch(
      getLatestHitOnePercent({
        fromEntryDate: from,
        toEntryDate: to
      })
    );
  }, [dispatch, fromKey, toKey]);

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
    const largeChartUrl = `${appEnvs.default.feHost}/en/symbol`;

    script.innerHTML = JSON.stringify(
      {
        symbols,
        colorTheme: 'light',
        locale: 'en',
        largeChartUrl,
        isTransparent: false,
        showSymbolLogo: true,
        displayMode: 'regular'
      },
      null,
      2
    );

    el.appendChild(script);

    return () => {
      el.innerHTML = '';
    };
  }, [symbols]);

  return (
    <div
      css={css`
        width: calc(100% + 3rem) !important;
        height: 100%;
      `}
      className='tradingview-widget-container'
      ref={container}
    />
  );
}

export default memo(LatestHitOnePercentTickerTape);
