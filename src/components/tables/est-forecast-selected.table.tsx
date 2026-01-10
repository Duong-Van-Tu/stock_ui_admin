/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  Table,
  TableColumnsType,
  Button,
  Space,
  Input,
  Popconfirm
} from 'antd';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  deleteEstForecast,
  getCountEstForecast,
  getEstForecastFilterPaging,
  resetAddEstForecastState,
  updateEstForecast,
  watchEstForecastAddSuccess,
  watchEstForecastFilterList,
  watchEstForecastFilterLoading,
  watchEstForecastLastAddedEarningsDate,
  watchEstForecastPagination
} from '@/redux/slices/est-forecast.slice';
import { useModal } from '@/hooks/modal.hook';
import { EstForecastTable } from './est-forecast.table';
import { isNumeric, roundToDecimals, lightenColor } from '@/utils/common';
import { EstForecastFilter } from '../filters/est-forecast.filter';
import { cleanFalsyValues } from '@/utils/common';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { EstForecastValuePointCell } from './columns/est-forecast-value-point-cell.column';
import { SymbolCell } from './columns/symbol-cell.column';
import { formatMarketCap } from '@/utils/common';
import { isMobile } from 'react-device-detect';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { TableTitle } from './title.table';
import { PageURLs } from '@/utils/navigate';
import EstForecastForm from '@/components/forms/est-forecast.form';

export const EstForecastSelectedTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { openModal, closeModal } = useModal();
  const { height } = useWindowSize();
  const locale = useLocale() || 'en';

  const loading = useAppSelector(watchEstForecastFilterLoading);
  const filterList = useAppSelector(watchEstForecastFilterList);
  const pagination = useAppSelector(watchEstForecastPagination);
  const addSuccess = useAppSelector(watchEstForecastAddSuccess);
  const lastAddedEarningsDate = useAppSelector(
    watchEstForecastLastAddedEarningsDate
  );

  const [searchValue, setSearchValue] = useState('');

  const earningDate = useMemo(() => {
    const date = searchParams.get('earningsDate');
    return date
      ? dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');
  }, [searchParams]);

  const handleFilter = (values: { startDate: string; endDate: string }) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('earningsDate', values.startDate);
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  const fetchEstForecast = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit
    }: PageChangeParams = {}) => {
      const symbol = searchParams.get('symbol') || undefined;
      const earningsDate = searchParams.get('earningsDate') || undefined;

      const filter = cleanFalsyValues({
        symbol,
        startDate: earningsDate,
        endDate: earningsDate
      });

      dispatch(
        getEstForecastFilterPaging({
          page,
          limit: pageSize,
          ...filter
        })
      );
    },
    [dispatch, searchParams]
  );

  useEffect(() => {
    const earningsDateInUrl = searchParams.get('earningsDate');

    if (earningsDateInUrl) {
      fetchEstForecast({});
    } else {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('earningsDate', dayjs().format('YYYY-MM-DD'));
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.replace(`${pathname}${query}`);
    }
  }, [searchParams, fetchEstForecast, pathname, router]);

  const handleSearch = (value: string) => {
    if (!value) return;
    setSearchValue('');
    openModal(<EstForecastTable symbol={value} />, { width: 1600 });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    fetchEstForecast({ page, pageSize });
  };

  useEffect(() => {
    if (addSuccess) {
      fetchEstForecast({});
      const earningsDate =
        searchParams.get('earningsDate') || dayjs().format('YYYY-MM-DD');
      dispatch(
        getCountEstForecast({
          fromDate: earningsDate,
          toDate: earningsDate
        })
      );
      if (lastAddedEarningsDate) {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set('earningsDate', lastAddedEarningsDate);
        const search = current.toString();
        const query = search ? `?${search}` : '';
        router.push(`${pathname}${query}`);
      }
      dispatch(resetAddEstForecastState());
    }
  }, [
    addSuccess,
    dispatch,
    fetchEstForecast,
    lastAddedEarningsDate,
    pathname,
    router,
    searchParams
  ]);

  const startEdit = useCallback(
    (record: EstForecastFilterItem) => {
      openModal(
        <EstForecastForm
          visible={true}
          initialValues={record}
          mode='edit'
          onCancel={() => closeModal()}
          onSubmit={(values) => {
            dispatch(
              updateEstForecast({ id: record.id, payload: values as any })
            );
            closeModal();
          }}
        />,
        { width: 800 }
      );
    },
    [openModal, closeModal, dispatch]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      await dispatch(deleteEstForecast(id));
      const earningsDate =
        searchParams.get('earningsDate') || dayjs().format('YYYY-MM-DD');
      dispatch(
        getCountEstForecast({
          fromDate: earningsDate,
          toDate: earningsDate
        })
      );
    },
    [dispatch, searchParams]
  );

  const renderNumber = useCallback(
    (
      value: any,
      _field: keyof EstForecastFilterItem | string,
      _record: EstForecastFilterItem,
      suffix?: string
    ) => {
      if (!isNumeric(value)) return '-';
      return (
        <div>
          {roundToDecimals(value, 2)}
          {suffix}
        </div>
      );
    },
    []
  );

  const renderText = useCallback(
    (
      value: any,
      _field: keyof EstForecastFilterItem | string,
      _record: EstForecastFilterItem
    ) => {
      if (value == null) return '-';
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? '-' : trimmed;
      }
      return String(value);
    },
    []
  );

  const renderAction = useCallback(
    (_: any, record: EstForecastFilterItem) => {
      return (
        <Space>
          <Button type='primary' onClick={() => startEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title='Are you sure you want to delete this item?'
            onConfirm={() => handleDelete(record.id)}
            okText='Yes'
            cancelText='No'
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      );
    },
    [handleDelete, startEdit]
  );

  const columns: TableColumnsType<EstForecastFilterItem> = useMemo(
    () => [
      {
        title: t('symbol'),
        dataIndex: 'symbol',
        width: isMobile ? 110 : 200,
        fixed: 'left',
        onCell: (record) => ({
          style: {
            backgroundColor: record.forecast
              ? lightenColor(record.forecast, 0.5)
              : 'transparent'
          }
        }),
        render: (_, record) => (
          <SymbolCell
            symbol={record.symbol}
            companyName={isMobile ? undefined : record.company}
            link={`${PageURLs.ofFinnhubLsegNews()}?symbol=${record.symbol}`}
          />
        )
      },
      {
        title: 'Earnings Date',
        dataIndex: 'earningsDate',
        width: 130,
        align: 'center',
        render: (v) => (v ? dayjs(v).format('MM-DD-YYYY') : '-')
      },
      {
        title: 'Trade Date',
        dataIndex: 'tradeDate',
        width: 130,
        align: 'center',
        render: (v) => (v ? dayjs(v).format('MM-DD-YYYY') : '-')
      },
      {
        title: 'Entry Date',
        dataIndex: 'entryDate',
        width: 150,
        align: 'center',
        render: (v) => (v ? dayjs(v).format('MM-DD-YYYY') : '-')
      },
      {
        title: 'Entry Price',
        dataIndex: 'entryPrice',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'entryPrice', r)
      },
      {
        title: 'Current Price',
        dataIndex: 'currentPrice',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'currentPrice', r)
      },
      {
        title: 'Highest Price',
        dataIndex: 'highestPrice',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'highestPrice', r)
      },
      {
        title: 'Highest 3 Days Price',
        dataIndex: 'highest3DaysPrice',
        width: 180,
        align: 'center',
        render: (v, r) => renderNumber(v, 'highest3DaysPrice', r)
      },
      {
        title: 'Lowest 3 Days Price',
        dataIndex: 'lowest3DaysPrice',
        width: 180,
        align: 'center',
        render: (v, r) => renderNumber(v, 'lowest3DaysPrice', r)
      },
      {
        title: 'Industry',
        dataIndex: 'industry',
        width: 160,
        render: (v) => v || '-'
      },
      {
        title: 'Call Time',
        dataIndex: 'callTime',
        width: 140,
        align: 'center',
        render: (v, r) => renderText(v, 'callTime', r)
      },
      {
        title: 'Beta',
        dataIndex: 'beta',
        width: 90,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v) : '-')
      },
      {
        title: 'Market Cap',
        dataIndex: 'marketCapEstForecast',
        width: 130,
        align: 'center',
        render: (value) => (value ? formatMarketCap(value / 1000000) : '-')
      },
      {
        title: (
          <span>
            Revenue Forecast
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'revenueForecast',
        width: 150,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.revenueForecastPoint} />
        )
      },
      {
        title: (
          <span>
            Net Margin
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'netMargin',
        width: 120,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={`${v}%`} point={r.netMarginPoint} />
        )
      },
      {
        title: (
          <span>
            EPS Estimate
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'epsEstimateESTEarnings',
        width: 130,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.epsEstimatePoint} />
        )
      },
      {
        title: (
          <span>
            EPS Trend
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'epsTrend',
        width: 120,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.epsTrendPoint} />
        )
      },
      {
        title: (
          <span>
            EPS Beat Freq
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'epsBeatFreq',
        width: 130,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.epsBeatFreqPoint} />
        )
      },
      {
        title: (
          <span>
            Revenue Beat Freq
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'revenueBeatFreq',
        width: 156,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.revenueBeatFreqPoint} />
        )
      },
      {
        title: (
          <span>
            Avg Surprise
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'avgSurpriseMagnitude',
        width: 136,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell
            value={v}
            point={r.avgSurpriseMagnitudePoint}
          />
        )
      },
      {
        title: (
          <span>
            Post Earning Drift
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'postEarningDrift',
        width: 146,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell
            value={v}
            point={r.postEarningDriftPoint}
          />
        )
      },
      {
        title: (
          <span>
            YTD Performance
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'ytdPerformance',
        width: 154,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.ytdPerformancePoint} />
        )
      },
      {
        title: (
          <span>
            Price Target
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'priceTarget',
        width: 140,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.priceTargetPoint} />
        )
      },
      {
        title: (
          <span>
            Yahoo Rec
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'yahooRec',
        width: 170,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v || '-'} point={r.yahooRecPoint} />
        )
      },
      {
        title: (
          <span>
            AI Rating
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'aiRating',
        width: 120,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.aiRatingPoint} />
        )
      },
      {
        title: (
          <span>
            GPT Rating
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'gptRating',
        width: 130,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.gptRatingPoint} />
        )
      },
      {
        title: (
          <span>
            Grok
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'grok',
        width: 130,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v || '-'} point={r.grokPoint} />
        )
      },
      {
        title: (
          <span>
            GPT
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'gpt',
        width: 120,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v || '-'} point={r.gptPoint} />
        )
      },
      {
        title: 'LSEG News Total Score Point',
        dataIndex: 'lsegNewsTotalScorePoint',
        width: 220,
        align: 'center',
        render: (v, r) => renderNumber(v, 'lsegNewsTotalScorePoint', r)
      },
      {
        title: (
          <span>
            LSEG News Score (1D)
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'lsegNewsScore1d',
        width: 200,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.lsegNewsScore1dPoint} />
        )
      },
      {
        title: (
          <span>
            LSEG News Score (3D)
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'lsegNewsScore3d',
        width: 200,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.lsegNewsScore3dPoint} />
        )
      },
      {
        title: 'Article 12h',
        dataIndex: 'article12h',
        width: 130,
        align: 'center',
        render: (v, r) => renderText(v, 'article12h', r)
      },
      {
        title: (
          <span>
            MP Earnings Dir
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'marketpsychEarningsDirectionZ',
        width: 140,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell
            value={v}
            point={r.marketpsychEarningsDirectionZPoint}
          />
        )
      },
      {
        title: (
          <span>
            MP Earnings Forecast
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'marketpsychEarningsForecastZ',
        width: 180,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell
            value={v}
            point={r.marketpsychEarningsForecastZPoint}
          />
        )
      },
      {
        title: (
          <span>
            MP Revenue Dir
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'marketpsychRevenueDirectionZ',
        width: 150,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell
            value={v}
            point={r.marketpsychRevenueDirectionZPoint}
          />
        )
      },
      {
        title: (
          <span>
            MP Revenue Forecast
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'marketpsychRevenueForecastZ',
        width: 170,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell
            value={v}
            point={r.marketpsychRevenueForecastZPoint}
          />
        )
      },
      {
        title: (
          <span>
            MP Price Up
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'marketpsychPriceUpZ',
        width: 130,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell
            value={v}
            point={r.marketpsychPriceUpZPoint}
          />
        )
      },
      {
        title: (
          <span>
            MP Optimism
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'marketpsychOptimismZ',
        width: 130,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell
            value={v}
            point={r.marketpsychOptimismZPoint}
          />
        )
      },
      {
        title: (
          <span>
            MP Trust
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'marketpsychTrustZ',
        width: 140,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell
            value={v}
            point={r.marketpsychTrustZPoint}
          />
        )
      },
      {
        title: 'Note for Trader',
        dataIndex: 'noteForTrader',
        width: 130,
        align: 'center',
        render: (v, r) => renderText(v, 'noteForTrader', r)
      },
      {
        title: (
          <span>
            Aggregate Score
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'aggregateScore',
        width: 180,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.aggregateScorePoint} />
        )
      },
      {
        title: 'Forecast Pct',
        dataIndex: 'forecastPct',
        width: 130,
        align: 'center',
        render: (v, r) => renderNumber(v, 'forecastPct', r, '%')
      },
      {
        title: 'Forecast',
        dataIndex: 'forecast',
        width: 120,
        align: 'center',
        render: (v) => {
          if (!v) return '-';
          return (
            <div
              style={{
                width: '80px',
                height: '24px',
                margin: '0 auto',
                borderRadius: 4,
                backgroundColor: v,
                border: '1px solid #ccc'
              }}
            />
          );
        }
      },
      {
        title: t('action'),
        width: 170,
        align: 'center',
        fixed: !isMobile && 'right',
        render: renderAction
      }
    ],

    [t, renderNumber, renderText, renderAction]
  );

  return (
    <div css={rootStyles}>
      <EstForecastFilter
        onFilter={handleFilter}
        selectedDate={searchParams.get('earningsDate') || undefined}
      />

      <div css={tableWrapperStyles}>
        <div css={titleRowStyles}>
          <TableTitle>
            {t('earningTitle')}{' '}
            {dayjs(earningDate).locale(locale).format('ddd, MMM DD')}
          </TableTitle>
          <Input.Search
            placeholder={t('searchToAddEstForecast')}
            enterButton={t('search')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
            onSearch={handleSearch}
            allowClear
            style={{ width: 320 }}
          />
        </div>

        <>
          <Table
            loading={loading}
            rowKey={(record) => record.key!}
            size={isMobile ? 'small' : 'middle'}
            css={tableStyles}
            columns={columns}
            dataSource={filterList}
            scroll={{
              x: 1200,
              y: filterList.length > 0 ? height - 326 : undefined
            }}
            locale={{
              emptyText: (
                <div css={emptyStyles(height - 400)}>
                  <EmptyDataTable />
                </div>
              )
            }}
            pagination={{
              current: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.total,
              position: ['bottomCenter'],
              showSizeChanger: true,
              showQuickJumper: true,
              onChange: handlePageChange
            }}
          />
        </>
      </div>
    </div>
  );
};

const rootStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const titleRowStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.6rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
  .ant-pagination {
    margin: 1.2rem 0 !important;
    gap: 0.4rem;
  }
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
