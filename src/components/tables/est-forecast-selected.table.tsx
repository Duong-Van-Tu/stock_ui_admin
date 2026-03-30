/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  Table,
  TableColumnsType,
  Button,
  Space,
  Input,
  Popconfirm,
  Tooltip,
  Modal,
  Pagination
} from 'antd';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  deleteEstForecast,
  getEstForecastActiveFilterPaging,
  getCountEstForecast,
  getEstForecastFilterPaging,
  resetAddEstForecastState,
  updateEstForecast,
  watchEstForecastAddSuccess,
  watchEstForecastFilterList,
  watchEstForecastFilterLoading,
  watchEstForecastLastAddedEarningsDate,
  watchEstForecastPagination,
  watchEstForecastSubmitting
} from '@/redux/slices/est-forecast.slice';
import { useModal } from '@/hooks/modal.hook';
import { EstForecastTable } from './est-forecast.table';
import {
  isNumeric,
  roundToDecimals,
  lightenColor,
  stripTimeFromISOString
} from '@/utils/common';
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
import { EmptyDataTable } from './empty.table';
import { TableTitle } from './title.table';
import { PageURLs } from '@/utils/navigate';
import EstForecastForm from '@/components/forms/est-forecast.form';
import { Icon } from '../icons';
import { ImportSymbolButton } from '../import-symbol-template';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformEstForecastOptionRecommendations } from '@/helpers/est-forecast.helper';
import { DateTimeCell } from './columns/date-time-cell.column';
import { StockChangeCell } from './columns/stock-change-cell.column';
import EllipsisText from '../ellipsis-text';

type EstForecastSelectedTableProps = {
  mode?: 'date' | 'active';
};

export const EstForecastSelectedTable = ({
  mode = 'date'
}: EstForecastSelectedTableProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { openModal, closeModal } = useModal();
  const locale = useLocale() || 'en';

  const loading = useAppSelector(watchEstForecastFilterLoading);
  const filterList = useAppSelector(watchEstForecastFilterList);
  const pagination = useAppSelector(watchEstForecastPagination);
  const addSuccess = useAppSelector(watchEstForecastAddSuccess);
  const lastAddedEarningsDate = useAppSelector(
    watchEstForecastLastAddedEarningsDate
  );
  const submitting = useAppSelector(watchEstForecastSubmitting);

  const [searchValue, setSearchValue] = useState('');
  const [optionResultLoadingMap, setOptionResultLoadingMap] = useState<
    Record<number, boolean>
  >({});

  const earningDate = useMemo(() => {
    if (mode !== 'date') return dayjs().format('YYYY-MM-DD');

    const date = searchParams.get('earningsDate');
    return date
      ? dayjs(date, 'YYYY-MM-DD').format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');
  }, [mode, searchParams]);

  const callData = useMemo(
    () => filterList.filter((item) => item.type === 'call'),
    [filterList]
  );
  const putData = useMemo(
    () => filterList.filter((item) => item.type === 'put'),
    [filterList]
  );

  const getUpcomingEarningRowClassName = (record: EstForecastFilterItem) => {
    if (!isNumeric(record.diffDays)) return '';

    const diffDays = Number(record.diffDays);
    return diffDays >= 0 && diffDays <= 3 ? 'upcoming-earning-row' : '';
  };

  const handleFilter = (values: { startDate: string; endDate: string }) => {
    if (mode !== 'date') return;

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

      if (mode === 'active') {
        const filter = cleanFalsyValues({ symbol });

        dispatch(
          getEstForecastActiveFilterPaging({
            page,
            limit: pageSize,
            ...filter
          })
        );
        return;
      }

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
    [dispatch, mode, searchParams]
  );

  const handleRefresh = useCallback(() => {
    fetchEstForecast({
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    });
  }, [fetchEstForecast, pagination.currentPage, pagination.pageSize]);

  useEffect(() => {
    if (mode !== 'date') {
      fetchEstForecast({});
      return;
    }

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
  }, [mode, searchParams, fetchEstForecast, pathname, router]);

  const handleSearch = (value: string) => {
    if (!value) return;
    setSearchValue('');
    openModal(
      <EstForecastTable symbol={value} defaultEarningsDate={earningDate} />,
      { width: 1600 }
    );
  };

  const handlePageChange = (page: number, pageSize: number) => {
    fetchEstForecast({ page, pageSize });
  };

  useEffect(() => {
    if (addSuccess) {
      fetchEstForecast({});

      if (mode === 'date') {
        const earningsDate =
          searchParams.get('earningsDate') || dayjs().format('YYYY-MM-DD');
        dispatch(
          getCountEstForecast({
            fromDate: earningsDate,
            toDate: earningsDate
          })
        );
        if (lastAddedEarningsDate) {
          const current = new URLSearchParams(
            Array.from(searchParams.entries())
          );
          current.set('earningsDate', lastAddedEarningsDate);
          const search = current.toString();
          const query = search ? `?${search}` : '';
          router.push(`${pathname}${query}`);
        }
      }

      dispatch(resetAddEstForecastState());
    }
  }, [
    addSuccess,
    dispatch,
    fetchEstForecast,
    lastAddedEarningsDate,
    mode,
    pathname,
    router,
    searchParams
  ]);

  const [justSubmitted, setJustSubmitted] = useState(false);
  useEffect(() => {
    if (justSubmitted && !submitting) {
      setJustSubmitted(false);
      closeModal();
      handleRefresh();
    }
  }, [justSubmitted, submitting, closeModal, handleRefresh]);

  const startEdit = useCallback(
    (record: EstForecastFilterItem) => {
      setJustSubmitted(false);
      openModal(
        <EstForecastForm
          visible={true}
          initialValues={record}
          mode='edit'
          onCancel={() => closeModal()}
          onSubmit={(values) => {
            setJustSubmitted(true);
            dispatch(
              updateEstForecast({ id: record.id, payload: values as any })
            );
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
      if (mode === 'date') {
        const earningsDate =
          searchParams.get('earningsDate') || dayjs().format('YYYY-MM-DD');
        dispatch(
          getCountEstForecast({
            fromDate: earningsDate,
            toDate: earningsDate
          })
        );
      }
    },
    [dispatch, mode, searchParams]
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

  const openReasoningModal = useCallback(
    (reasoning: string, symbol: string) => {
      Modal.info({
        title: `Reasoning (${symbol})`,
        width: 900,
        content: <div css={reasoningModalStyles}>{reasoning || '-'}</div>
      });
    },
    []
  );

  const handleViewOptionResults = useCallback(
    async (record: EstForecastFilterItem) => {
      if (!record.id) return;

      setOptionResultLoadingMap((prev) => ({ ...prev, [record.id]: true }));
      try {
        const response = await defaultApiFetcher.get(
          `est-forecast/${record.id}/option-recommendations`
        );

        const payload = response?.data;
        const list = transformEstForecastOptionRecommendations(payload ?? []);

        const modalColumns: TableColumnsType<EstForecastOptionRecommendation> =
          [
            {
              title: 'AI Updated At',
              dataIndex: 'aiUpdatedAt',
              width: 130,
              align: 'center',
              render: (value) =>
                value ? <DateTimeCell value={value} convertTimeZone /> : '-'
            },
            {
              title: 'Reasoning',
              dataIndex: 'reasoning',
              width: 120,
              align: 'center',
              render: (value, row) =>
                value ? (
                  <Button
                    type='link'
                    block
                    onClick={() => openReasoningModal(value, row.symbol)}
                  >
                    Reasoning
                  </Button>
                ) : (
                  '-'
                )
            },
            {
              title: 'Strategy Name',
              dataIndex: 'strategyName',
              width: 320,
              render: (value) => <EllipsisText text={value} maxLines={2} />
            },

            {
              title: 'Expiration Date',
              dataIndex: 'expirationDate',
              width: 150,
              align: 'center',
              render: (value) => (value ? stripTimeFromISOString(value) : '-')
            },
            { title: 'DTE', dataIndex: 'dte', width: 80, align: 'center' },
            {
              title: 'Strike Price',
              dataIndex: 'strikePrice',
              width: 120,
              align: 'center',
              render: (value) =>
                isNumeric(value) ? roundToDecimals(Number(value), 2) : '-'
            },
            {
              title: 'Option Type',
              dataIndex: 'optionType',
              width: 110,
              align: 'center'
            },
            {
              title: 'Delta',
              dataIndex: 'delta',
              width: 100,
              align: 'center',
              render: (value) =>
                isNumeric(value) ? roundToDecimals(Number(value), 4) : '-'
            },
            {
              title: 'Implied Volatility',
              dataIndex: 'impliedVolatility',
              width: 160,
              align: 'center',
              render: (value) =>
                isNumeric(value) ? roundToDecimals(Number(value), 4) : '-'
            },
            {
              title: 'Vega Desc',
              dataIndex: 'vegaDesc',
              width: 110,
              align: 'center'
            },
            {
              title: 'Theta Desc',
              dataIndex: 'thetaDesc',
              width: 120,
              align: 'center'
            },
            {
              title: 'ITM Prob (%)',
              dataIndex: 'itmProbPercent',
              width: 130,
              align: 'center',
              render: (value) =>
                isNumeric(value) ? roundToDecimals(Number(value), 2) : '-'
            }
          ];

        openModal(
          <div css={optionResultsModalStyles}>
            <h2>{`Option Recommendations (${record.symbol})`}</h2>
            <Table<EstForecastOptionRecommendation>
              size='small'
              rowKey={(row) => row.key}
              columns={modalColumns}
              dataSource={list}
              pagination={false}
              scroll={{ x: 1700, y: 520 }}
            />
          </div>,
          { width: 1600 }
        );
      } finally {
        setOptionResultLoadingMap((prev) => ({ ...prev, [record.id]: false }));
      }
    },
    [openModal, openReasoningModal]
  );

  const renderAction = useCallback(
    (_: any, record: EstForecastFilterItem) => {
      if (mode === 'active') {
        const query = new URLSearchParams({
          est_id: String(record.id),
          symbol: record.symbol
        }).toString();

        return (
          <ImportSymbolButton
            width={112}
            url={`est-forecast-attachment/upload?${query}`}
            onSuccess={handleRefresh}
            buttonText={record.urlFile ? 'Uploaded' : 'Upload'}
            buttonType={record.urlFile ? 'primary' : 'default'}
            size='middle'
          />
        );
      }

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
    [handleDelete, handleRefresh, mode, startEdit]
  );

  const getForecastCellBackground = useCallback((forecast?: string | null) => {
    return forecast
      ? lightenColor(forecast, 0.5)
      : 'var(--surface-elevated-color)';
  }, []);

  const getContrastTextColor = useCallback((backgroundColor: string) => {
    const rgbMatch = backgroundColor.match(/\d+/g);
    if (!rgbMatch || rgbMatch.length < 3) {
      return {
        symbolColor: 'var(--symbol-color)',
        companyNameColor: 'var(--text-primary-strong-color)'
      };
    }

    const [r, g, b] = rgbMatch.slice(0, 3).map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    if (luminance > 0.72) {
      return {
        symbolColor: '#1d4ed8',
        companyNameColor: '#111827'
      };
    }

    return {
      symbolColor: '#dbeafe',
      companyNameColor: '#f9fafb'
    };
  }, []);

  const columns: TableColumnsType<EstForecastFilterItem> = useMemo(
    () => [
      {
        title: t('symbol'),
        dataIndex: 'symbol',
        width: isMobile ? 110 : 200,
        fixed: 'left',
        onCell: (record) => ({
          style: {
            backgroundColor: getForecastCellBackground(record.forecast)
          }
        }),
        render: (_, record) => {
          const backgroundColor = getForecastCellBackground(record.forecast);
          const { symbolColor, companyNameColor } =
            getContrastTextColor(backgroundColor);

          return (
            <SymbolCell
              symbol={record.symbol}
              companyName={isMobile ? undefined : record.company}
              symbolColor={symbolColor}
              companyNameColor={companyNameColor}
              link={`${PageURLs.ofFinnhubLsegNews()}?symbol=${record.symbol}`}
            />
          );
        }
      },
      {
        title: 'Forecast Pct',
        dataIndex: 'forecastPct',
        width: 130,
        align: 'center',
        render: (v, r) => renderNumber(v, 'forecastPct', r, '%')
      },
      {
        title: 'Note for Trader',
        dataIndex: 'noteForTrader',
        width: 300,
        align: 'center',
        render: (v, r) => renderText(v, 'noteForTrader', r)
      },
      {
        title: 'LSEG Starmine',
        dataIndex: 'lsegStarmine',
        width: 260,
        align: 'center',
        render: (v, r) => (
          <div css={multilineCellStyles}>
            {renderText(v, 'lsegStarmine', r)}
          </div>
        )
      },
      ...((mode === 'active'
        ? [
            {
              title: 'Diff Days',
              dataIndex: 'diffDays',
              width: 110,
              align: 'center',
              render: (v, r) => renderNumber(v, 'diffDays', r)
            },
            {
              title: 'AI Recommend',
              dataIndex: 'aiRecommend',
              width: 130,
              align: 'center',
              render: (v, r) => {
                if (`${v}`.toLowerCase() === 'success') {
                  return (
                    <Button
                      type='link'
                      loading={!!optionResultLoadingMap[r.id]}
                      onClick={() => handleViewOptionResults(r)}
                    >
                      View result
                    </Button>
                  );
                }
                return '-';
              }
            }
          ]
        : []) as TableColumnsType<EstForecastFilterItem>),
      {
        title: 'Earnings Date',
        dataIndex: 'earningsDate',
        width: 130,
        align: 'center',
        render: (v) => (v ? stripTimeFromISOString(v) : '-')
      },
      {
        title: 'Earnings Time',
        dataIndex: 'dateAtEarning',
        width: 170,
        align: 'center',
        render: (value) =>
          value ? <DateTimeCell value={value} convertTimeZone /> : '-'
      },
      {
        title: 'Earnings Price',
        dataIndex: 'priceAtEarning',
        width: 140,
        align: 'center',
        render: (v, r) => renderNumber(v, 'priceAtEarning', r)
      },
      {
        title: 'Current Price',
        dataIndex: 'priceCurrentEstForecast',
        width: 130,
        align: 'center',
        render: (v, r) =>
          isNumeric(v) && isNumeric(r.percentEstForecast) ? (
            <StockChangeCell value={v} percentage={Number(r.percentEstForecast)} />
          ) : isNumeric(v) ? (
            renderNumber(v, 'priceCurrentEstForecast', r)
          ) : (
            '-'
          )
      },
      {
        title: 'Trade Date',
        dataIndex: 'tradeDate',
        width: 130,
        align: 'center',
        render: (v) => (v ? stripTimeFromISOString(v) : '-')
      },
      {
        title: 'Entry Date',
        dataIndex: 'entryDate',
        width: 150,
        align: 'center',
        render: (v) => (v ? stripTimeFromISOString(v) : '-')
      },
      {
        title: 'Entry Price',
        dataIndex: 'entryPrice',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'entryPrice', r)
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
            Startmine
            <br />
            (Point)
          </span>
        ),
        dataIndex: 'startmine',
        width: 120,
        align: 'center',
        render: (v, r) => (
          <EstForecastValuePointCell value={v} point={r.startminePoint} />
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
        width: mode === 'active' ? 142 : 170,
        align: 'center',
        fixed: !isMobile && 'right',
        render: renderAction
      }
    ],

    [
      mode,
      t,
      renderNumber,
      renderText,
      renderAction,
      optionResultLoadingMap,
      handleViewOptionResults,
      getContrastTextColor,
      getForecastCellBackground
    ]
  );

  return (
    <div css={rootStyles}>
      {mode === 'date' ? (
        <EstForecastFilter
          onFilter={handleFilter}
          selectedDate={searchParams.get('earningsDate') || undefined}
        />
      ) : null}

      <div css={tableWrapperStyles}>
        <div css={titleRowStyles}>
          <TableTitle customStyles={titleStyles}>
            <span>
              {mode === 'date'
                ? `${t('earningTitle')}${dayjs(earningDate)
                    .locale(locale)
                    .format('ddd, MMM DD')}`
                : t('earningSelection')}
            </span>
            <Tooltip title={!isMobile && t('refresh')}>
              <Button
                onClick={handleRefresh}
                type='text'
                icon={<Icon icon='refresh' width={22} height={22} />}
              />
            </Tooltip>
          </TableTitle>
          <div css={actionGroupStyles}>
            {mode !== 'active' ? (
              <Input.Search
                placeholder={t('searchToAddEstForecast')}
                enterButton={t('search')}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
                onSearch={handleSearch}
                allowClear
                style={{ width: 320 }}
              />
            ) : null}
          </div>
        </div>

        <div css={tablesContainerStyles}>
          <div css={tableSectionStyles}>
            <div css={typeHeaderStyles('call')}>CALL</div>
            <Table
              loading={loading}
              rowKey={(record) => record.key!}
              rowClassName={getUpcomingEarningRowClassName}
              size={isMobile ? 'small' : 'middle'}
              css={tableStyles}
              columns={columns}
              dataSource={callData}
              scroll={{ x: 1200 }}
              pagination={false}
              locale={{
                emptyText: (
                  <div css={emptyStyles(200)}>
                    <EmptyDataTable />
                  </div>
                )
              }}
            />
          </div>

          <div css={tableSectionStyles}>
            <div css={typeHeaderStyles('put')}>PUT</div>
            <Table
              loading={loading}
              rowKey={(record) => record.key!}
              rowClassName={getUpcomingEarningRowClassName}
              size={isMobile ? 'small' : 'middle'}
              css={tableStyles}
              columns={columns}
              dataSource={putData}
              scroll={{ x: 1200 }}
              pagination={false}
              locale={{
                emptyText: (
                  <div css={emptyStyles(200)}>
                    <EmptyDataTable />
                  </div>
                )
              }}
            />
          </div>
        </div>

        <div css={paginationWrapperStyles}>
          <Pagination
            current={pagination.currentPage}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            onChange={handlePageChange}
          />
        </div>
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
  gap: 1.2rem;
  flex-wrap: wrap;
  padding: 1.2rem 1.6rem;
  border-bottom: 1px solid var(--border-table-color);
`;

const actionGroupStyles = css`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
`;

const tablesContainerStyles = css`
  display: flex;
  flex-direction: column;
`;

const tableSectionStyles = css`
  display: flex;
  flex-direction: column;
`;

const typeHeaderStyles = (type: 'call' | 'put') => css`
  background: ${type === 'call'
    ? 'var(--positive-color)'
    : 'var(--negative-color)'};
  color: white;
  padding: 0.6rem 1.6rem;
  font-weight: bold;
  font-size: 1.6rem;
  text-align: center;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }

  .ant-table-cell-fix-left,
  .ant-table-cell-fix-right,
  .ant-table-cell-fix-left-last,
  .ant-table-cell-fix-right-first {
    background: inherit;
  }

  .ant-table-tbody
    > tr.upcoming-earning-row
    > td:not(:first-of-type):not(:last-of-type) {
    background: ${lightenColor('#faad14', 0.85)} !important;
  }
`;

const paginationWrapperStyles = css`
  padding: 1.2rem;

  .ant-pagination {
    display: flex;
    justify-content: center;
    margin: 0 !important;
  }
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const titleStyles = css`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.2rem;
`;

const optionResultsModalStyles = css`
  h2 {
    text-align: center;
    margin-bottom: 0.8rem;
  }
`;

const reasoningModalStyles = css`
  white-space: pre-wrap;
  margin-bottom: 0;
  line-height: 1.5;
`;

const multilineCellStyles = css`
  white-space: pre-wrap;
  line-height: 1.5;
`;
