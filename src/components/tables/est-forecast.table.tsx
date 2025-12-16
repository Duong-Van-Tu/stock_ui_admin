/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetState,
  watchEstForecastLoading,
  watchEstForecastList,
  getEstForecastFilter,
  addEstForecast
} from '@/redux/slices/est-forecast.slice';
import { Table, TableColumnsType, Button } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cleanFalsyValues, isNumeric, roundToDecimals } from '@/utils/common';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { TableTitle } from './title.table';
import { isMobile } from 'react-device-detect';
import { useSearchParams } from 'next/navigation';
import { DateTimeCell } from './columns/date-time-cell.column';
import { PageURLs } from '@/utils/navigate';

export const EstForecastTable = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');
  const { height } = useWindowSize();

  const loading = useAppSelector(watchEstForecastLoading);
  const list = useAppSelector(watchEstForecastList);

  const [addedSymbols, setAddedSymbols] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(
      getEstForecastFilter(
        cleanFalsyValues({
          symbol: symbol ?? undefined
        })
      )
    );

    return () => {
      dispatch(resetState());
      setAddedSymbols(new Set());
    };
  }, [dispatch, symbol]);

  const handleAdd = useCallback(
    (record: EstForecast) => {
      setAddedSymbols((prev) => {
        const next = new Set(prev);
        next.add(record.symbol);
        return next;
      });

      dispatch(
        addEstForecast({
          symbol: record.symbol,
          company: record.company,
          industry: record.industry,
          callTime: record.callTime,
          beta: record.beta,
          marketCapEstForecast: record.marketCapEstForecast,
          result: record.result,
          epsEstimate: record.epsEstimate,
          reportedEps: record.reportedEps,
          surprise: record.surprise,
          prevEstimate: record.prevEstimate,
          ytdPerformance: record.ytdPerformance,
          aiRating: record.aiRating,
          totalScoreEstForecast: record.totalScoreEstForecast,
          routerRec: record.routerRec,
          yahooRec: record.yahooRec,
          priceTarget: record.priceTarget,
          growth: record.growth,
          gpt: record.gpt,
          forecast: record.forecast
        })
      );
    },
    [dispatch]
  );

  const columns: TableColumnsType<EstForecast> = useMemo(
    () => [
      {
        title: 'Symbol',
        dataIndex: 'symbol',
        key: 'symbol',
        width: 90,
        fixed: !isMobile && 'left'
      },
      { title: 'Company', dataIndex: 'company', key: 'company', width: 180 },
      { title: 'Industry', dataIndex: 'industry', key: 'industry', width: 160 },
      {
        title: 'Call Time',
        dataIndex: 'callTime',
        key: 'callTime',
        width: 140
      },
      {
        title: 'Beta',
        dataIndex: 'beta',
        key: 'beta',
        width: 90,
        align: 'center',
        render: (v) => (isNumeric(v) ? v : '-')
      },
      {
        title: 'Market Cap',
        dataIndex: 'marketCapEstForecast',
        key: 'marketCapEstForecast',
        width: 140
      },
      { title: 'Result', dataIndex: 'result', key: 'result', width: 120 },
      {
        title: 'EPS Est',
        dataIndex: 'epsEstimate',
        key: 'epsEstimate',
        width: 110,
        align: 'center',
        render: (v) => (isNumeric(v) ? v : '-')
      },
      {
        title: 'Reported EPS',
        dataIndex: 'reportedEps',
        key: 'reportedEps',
        width: 120,
        align: 'center',
        render: (v) => (isNumeric(v) ? v : '-')
      },
      {
        title: 'Surprise',
        dataIndex: 'surprise',
        key: 'surprise',
        width: 110,
        align: 'center',
        render: (v) => (isNumeric(v) ? `${roundToDecimals(v, 2)}%` : '-')
      },
      {
        title: 'Updated',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 140,
        align: 'center',
        render: (v) => (v ? <DateTimeCell value={v} /> : '-')
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        align: 'center',
        fixed: !isMobile && 'right',
        render: (_, record) =>
          addedSymbols.has(record.symbol) ? null : (
            <Button
              type='primary'
              size='small'
              onClick={() => handleAdd(record)}
            >
              Add
            </Button>
          )
      }
    ],
    [handleAdd, addedSymbols]
  );

  const hasSymbol = Boolean(symbol);

  return (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        <div css={titleRowStyles}>
          <TableTitle>
            Est Forecast
            <Link
              href={PageURLs.ofEstForecastSelected()}
              style={{ marginLeft: 12, fontSize: 14, color: '#1677ff' }}
            >
              View selected symbols
            </Link>
          </TableTitle>
        </div>

        {hasSymbol ? (
          <Table<EstForecast>
            size={isMobile ? 'small' : 'middle'}
            css={tableStyles}
            rowKey={(record) => record.key!}
            columns={columns}
            dataSource={list}
            loading={loading}
            scroll={{
              x: 1200,
              y: list.length > 0 ? height - 240 : undefined
            }}
            locale={{
              emptyText: (
                <div css={emptyStyles(height - 300)}>
                  <EmptyDataTable />
                </div>
              )
            }}
            pagination={false}
          />
        ) : (
          <div css={emptyStyles(height - 300)}>
            <EmptyDataTable />
          </div>
        )}
      </div>
    </div>
  );
};

const rootStyles = css`
  display: flex;
  flex-direction: column;
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const titleRowStyles = css`
  display: flex;
  align-items: center;
  padding: 1.2rem 1.6rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
