/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  Table,
  TableColumnsType,
  Button,
  Space,
  Input,
  InputNumber,
  DatePicker
} from 'antd';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  deleteEstForecast,
  getEstForecastFilterPaging,
  resetAddEstForecastState,
  updateEstForecast,
  watchEstForecastAddSuccess,
  watchEstForecastFilterList,
  watchEstForecastFilterLoading,
  watchEstForecastPagination
} from '@/redux/slices/est-forecast.slice';
import { useModal } from '@/hooks/modal.hook';
import { EstForecastTable } from './est-forecast.table';
import { isNumeric, roundToDecimals } from '@/utils/common';
import { EstForecastFilter } from '../filters/est-forecast.filter';
import { cleanFalsyValues } from '@/utils/common';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { convertSortType } from '@/utils/sort-table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { SymbolCell } from './columns/symbol-cell.column';
import { DateTimeCell } from './columns/date-time-cell.column';
import { formatMarketCap, formatNumberShort } from '@/utils/common';
import { isMobile } from 'react-device-detect';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { TableTitle } from './title.table';
import { PageURLs } from '@/utils/navigate';

const FORECAST_COLORS = ['#52c41a', '#fadb14', '#fa8c16', '#ff4d4f'];

export const EstForecastSelectedTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { openModal } = useModal();
  const { height } = useWindowSize();
  const locale = useLocale() || 'en';

  const loading = useAppSelector(watchEstForecastFilterLoading);
  const filterList = useAppSelector(watchEstForecastFilterList);
  const pagination = useAppSelector(watchEstForecastPagination);
  const addSuccess = useAppSelector(watchEstForecastAddSuccess);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<Partial<EstForecastFilterItem>>(
    {}
  );
  const [searchValue, setSearchValue] = useState('');
  const [filter, setFilter] = useState<{
    startDate?: string;
    endDate?: string;
    symbol?: string;
  }>({
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });

  const earningDate = useMemo(
    () =>
      filter.startDate
        ? dayjs(filter.startDate, 'YYYY-MM-DD').format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
    [filter.startDate]
  );

  const { sortField, sortType, handleSortOrder } = useSortOrder<any>({
    defaultField: 'earningsDate',
    defaultOrder: 'descend',
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      fetchEstForecast({ filter: newFilter });
    }
  });

  const handleFilter = (values: { startDate: string; endDate: string }) => {
    const newFilter = { ...filter, ...values, symbol: searchValue };
    setFilter(newFilter);
    fetchEstForecast({ filter: newFilter });
  };

  const fetchEstForecast = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const { ...restFilter } = filter || {};
      const filteredFilter = cleanFalsyValues(restFilter);
      const symbol = searchParams.get('symbol') || undefined;

      dispatch(
        getEstForecastFilterPaging({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          ...filteredFilter,
          symbol: symbol
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, sortField, sortType]
  );

  useEffect(() => {
    const symbol = searchParams.get('symbol');
    fetchEstForecast({
      filter: {
        startDate: earningDate,
        endDate: earningDate,
        symbol: symbol || undefined
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchEstForecast, searchParams]);

  const handleSearch = (value: string) => {
    if (!value) return;
    setSearchValue(value);
    openModal(<EstForecastTable symbol={value} />, { width: 1600 });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    fetchEstForecast({ page, pageSize, filter });
  };

  useEffect(() => {
    if (addSuccess) {
      fetchEstForecast({ filter });
      dispatch(resetAddEstForecastState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addSuccess]);

  const startEdit = (record: EstForecastFilterItem) => {
    setEditingId(record.id);
    setEditingRow(record);
  };

  const saveEdit = useCallback(() => {
    if (!editingId) return;
    dispatch(updateEstForecast({ id: editingId, payload: editingRow as any }));
    setEditingId(null);
    setEditingRow({});
  }, [dispatch, editingId, editingRow]);

  const renderNumber = useCallback(
    (
      value: any,
      field: keyof EstForecastFilterItem | string,
      record: EstForecastFilterItem,
      suffix?: string
    ) => {
      if (editingId === record.id) {
        return (
          <InputNumber
            value={(editingRow as any)[field] as number}
            onChange={(v) => setEditingRow((prev) => ({ ...prev, [field]: v }))}
            style={{ width: '100%' }}
          />
        );
      }
      if (!isNumeric(value)) return '-';
      return (
        <div>
          {roundToDecimals(value, 2)}
          {suffix}
        </div>
      );
    },
    [editingId, editingRow]
  );

  const renderText = useCallback(
    (
      value: any,
      field: keyof EstForecastFilterItem | string,
      record: EstForecastFilterItem
    ) => {
      if (editingId === record.id) {
        return (
          <Input
            value={(editingRow as any)[field]}
            onChange={(e) =>
              setEditingRow((prev) => ({ ...prev, [field]: e.target.value }))
            }
            style={{ width: '100%' }}
          />
        );
      }
      if (value == null) return '-';
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? '-' : trimmed;
      }
      return String(value);
    },
    [editingId, editingRow]
  );

  const renderDate = useCallback(
    (
      value: string | undefined,
      field: keyof EstForecastFilterItem | string,
      record: EstForecastFilterItem
    ) => {
      if (editingId === record.id) {
        const currentValue =
          ((editingRow as any)[field] as string | undefined) ?? value;
        return (
          <DatePicker
            value={currentValue ? dayjs(currentValue) : null}
            style={{ width: '100%' }}
            onChange={(d) =>
              setEditingRow((prev) => ({
                ...prev,
                [field]: d
                  ? dayjs.utc(d.format('YYYY-MM-DD')).toISOString()
                  : null
              }))
            }
          />
        );
      }
      return value ? <div>{dayjs(value).utc().format('MM-DD-YYYY')}</div> : '-';
    },
    [editingId, editingRow]
  );

  const renderAction = useCallback(
    (_: any, record: EstForecastFilterItem) => {
      return (
        <Space>
          {editingId === record.id ? (
            <>
              <Button
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                type='primary'
                onClick={saveEdit}
              >
                Save
              </Button>
              <Button onClick={() => setEditingId(null)}>Cancel</Button>
            </>
          ) : (
            <Button type='primary' onClick={() => startEdit(record)}>
              Edit
            </Button>
          )}
          <Button danger onClick={() => dispatch(deleteEstForecast(record.id))}>
            Delete
          </Button>
        </Space>
      );
    },
    [dispatch, editingId, saveEdit]
  );

  const columns: TableColumnsType<EstForecastFilterItem> = useMemo(
    () => [
      {
        title: t('symbol'),
        dataIndex: 'symbol',
        width: isMobile ? 110 : 160,
        fixed: 'left',
        render: (_, record) => (
          <SymbolCell
            symbolColor={record.forecast}
            symbol={record.symbol}
            companyName={isMobile ? undefined : record.company}
            link={`${PageURLs.ofFinnhubLsegNews()}?symbol=${record.symbol}`}
          />
        )
      },
      {
        title: 'Earnings Date',
        dataIndex: 'earningsDate',
        width: 150,
        align: 'center',
        render: (v, r) =>
          editingId === r.id ? (
            renderDate(v, 'earningsDate', r)
          ) : v ? (
            <DateTimeCell
              value={v}
              showTime={false}
              convertTimeZone={false}
              useUTC
            />
          ) : (
            '-'
          )
      },
      {
        title: 'Trade Date',
        dataIndex: 'tradeDate',
        width: 150,
        align: 'center',
        render: (v, r) =>
          editingId === r.id ? (
            renderDate(v, 'tradeDate', r)
          ) : v ? (
            <DateTimeCell
              value={v}
              showTime={false}
              convertTimeZone={false}
              useUTC
            />
          ) : (
            '-'
          )
      },
      { title: 'Industry', dataIndex: 'industry', width: 160 },
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
        render: (v) => roundToDecimals(v)
      },
      {
        title: 'Market Cap',
        dataIndex: 'marketCapEstForecast',
        width: 130,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'marketCap' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('marketCap')
        }),
        render: (value) => (value ? formatMarketCap(value / 1000000) : '-')
      },
      {
        title: 'EPS Estimate',
        dataIndex: 'epsEstimateESTEarnings',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'epsEstimateESTEarnings', r)
      },
      {
        title: 'EPS Point',
        dataIndex: 'epsEstimatePoint',
        width: 110,
        align: 'center',
        render: (v, r) => renderNumber(v, 'epsEstimatePoint', r)
      },
      {
        title: 'Revenue Forecast',
        dataIndex: 'revenueForecast',
        width: 150,
        align: 'center',
        render: (v, r) => {
          if (editingId === r.id) {
            return renderNumber(v, 'revenueForecast', r);
          }
          if (!isNumeric(v)) return '-';
          return formatNumberShort(Number(v));
        }
      },
      {
        title: 'Revenue Forecast Point',
        dataIndex: 'revenueForecastPoint',
        width: 182,
        align: 'center',
        render: (v, r) => renderNumber(v, 'revenueForecastPoint', r)
      },
      {
        title: 'Net Margin',
        dataIndex: 'netMargin',
        width: 130,
        align: 'center',
        render: (v, r) => renderNumber(v, 'netMargin', r, '%')
      },
      {
        title: 'Net Margin Point',
        dataIndex: 'netMarginPoint',
        width: 160,
        align: 'center',
        render: (v, r) => renderNumber(v, 'netMarginPoint', r)
      },
      {
        title: 'EPS Trend',
        dataIndex: 'epsTrend',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'epsTrend', r)
      },
      {
        title: 'EPS Trend Point',
        dataIndex: 'epsTrendPoint',
        width: 160,
        align: 'center',
        render: (v, r) => renderNumber(v, 'epsTrendPoint', r)
      },
      {
        title: 'EPS Beat Freq',
        dataIndex: 'epsBeatFreq',
        width: 140,
        align: 'center',
        render: (v, r) => renderNumber(v, 'epsBeatFreq', r, '%')
      },
      {
        title: 'EPS Beat Freq Point',
        dataIndex: 'epsBeatFreqPoint',
        width: 180,
        align: 'center',
        render: (v, r) => renderNumber(v, 'epsBeatFreqPoint', r)
      },
      {
        title: 'Avg Surprise',
        dataIndex: 'avgSurpriseMagnitude',
        width: 140,
        align: 'center',
        render: (v, r) => renderNumber(v, 'avgSurpriseMagnitude', r)
      },
      {
        title: 'Revenue Beat Freq',
        dataIndex: 'revenueBeatFreq',
        width: 160,
        align: 'center',
        render: (v, r) => renderNumber(v, 'revenueBeatFreq', r, '%')
      },
      {
        title: 'Revenue Beat Freq Point',
        dataIndex: 'revenueBeatFreqPoint',
        width: 200,
        align: 'center',
        render: (v, r) => renderNumber(v, 'revenueBeatFreqPoint', r)
      },
      {
        title: 'Avg Surprise Point',
        dataIndex: 'avgSurpriseMagnitudePoint',
        width: 180,
        align: 'center',
        render: (v, r) => renderNumber(v, 'avgSurpriseMagnitudePoint', r)
      },
      {
        title: 'Post Earning Drift',
        dataIndex: 'postEarningDrift',
        width: 170,
        align: 'center',
        render: (v, r) => renderNumber(v, 'postEarningDrift', r)
      },
      {
        title: 'Post Earning Drift Point',
        dataIndex: 'postEarningDriftPoint',
        width: 210,
        align: 'center',
        render: (v, r) => renderNumber(v, 'postEarningDriftPoint', r)
      },
      {
        title: 'YTD Performance',
        dataIndex: 'ytdPerformance',
        width: 150,
        align: 'center',
        render: (v, r) => renderNumber(v, 'ytdPerformance', r, '%')
      },
      {
        title: 'YTD Performance Point',
        dataIndex: 'ytdPerformancePoint',
        width: 180,
        align: 'center',
        render: (v, r) => renderNumber(v, 'ytdPerformancePoint', r)
      },
      {
        title: 'AI Rating',
        dataIndex: 'aiRating',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'aiRating', r)
      },
      {
        title: 'AI Rating Point',
        dataIndex: 'aiRatingPoint',
        width: 160,
        align: 'center',
        render: (v, r) => renderNumber(v, 'aiRatingPoint', r)
      },
      {
        title: 'Aggregate Score',
        dataIndex: 'aggregateScore',
        width: 150,
        align: 'center',
        render: (v, r) => renderNumber(v, 'aggregateScore', r)
      },
      {
        title: 'Aggregate Score Point',
        dataIndex: 'aggregateScorePoint',
        width: 190,
        align: 'center',
        render: (v, r) => renderNumber(v, 'aggregateScorePoint', r)
      },
      {
        title: 'Yahoo Rec',
        dataIndex: 'yahooRec',
        width: 170,
        align: 'center',
        render: (v, r) => renderText(v, 'yahooRec', r)
      },
      {
        title: 'Yahoo Rec Point',
        dataIndex: 'yahooRecPoint',
        width: 170,
        align: 'center',
        render: (v, r) => renderNumber(v, 'yahooRecPoint', r)
      },
      {
        title: 'Price Target',
        dataIndex: 'priceTarget',
        width: 140,
        align: 'center',
        render: (v, r) => renderNumber(v, 'priceTarget', r)
      },
      {
        title: 'Price Target Point',
        dataIndex: 'priceTargetPoint',
        width: 180,
        align: 'center',
        render: (v, r) => renderNumber(v, 'priceTargetPoint', r)
      },
      {
        title: 'Grok',
        dataIndex: 'grok',
        width: 120,
        align: 'center',
        render: (v, r) => renderText(v, 'grok', r)
      },
      {
        title: 'Grok Point',
        dataIndex: 'grokPoint',
        width: 150,
        align: 'center',
        render: (v, r) => renderNumber(v, 'grokPoint', r)
      },
      {
        title: 'GPT',
        dataIndex: 'gpt',
        width: 120,
        align: 'center',
        render: (v, r) => renderText(v, 'gpt', r)
      },
      {
        title: 'GPT Point',
        dataIndex: 'gptPoint',
        width: 150,
        align: 'center',
        render: (v, r) => renderNumber(v, 'gptPoint', r)
      },
      {
        title: 'GPT Rating',
        dataIndex: 'gptRating',
        width: 140,
        align: 'center',
        render: (v, r) => renderNumber(v, 'gptRating', r)
      },
      {
        title: 'GPT Rating Point',
        dataIndex: 'gptRatingPoint',
        width: 170,
        align: 'center',
        render: (v, r) => renderNumber(v, 'gptRatingPoint', r)
      },
      {
        title: 'LSEG News Score (1D)',
        dataIndex: 'lsegNewsScore1d',
        width: 130,
        align: 'center',
        render: (v, r) => renderNumber(v, 'lsegNewsScore1d', r)
      },
      {
        title: 'LSEG News Score (1D) Point',
        dataIndex: 'lsegNewsScore1dPoint',
        width: 180,
        align: 'center',
        render: (v, r) => renderNumber(v, 'lsegNewsScore1dPoint', r)
      },
      {
        title: 'LSEG News Total Score Point',
        dataIndex: 'lsegNewsTotalScorePoint',
        width: 200,
        align: 'center',
        render: (v, r) => renderNumber(v, 'lsegNewsTotalScorePoint', r)
      },
      {
        title: 'LSEG News Score (3D)',
        dataIndex: 'lsegNewsScore3d',
        width: 130,
        align: 'center',
        render: (v, r) => renderNumber(v, 'lsegNewsScore3d', r)
      },
      {
        title: 'LSEG News Score (3D) Point',
        dataIndex: 'lsegNewsScore3dPoint',
        width: 180,
        align: 'center',
        render: (v, r) => renderNumber(v, 'lsegNewsScore3dPoint', r)
      },
      {
        title: 'Article 12h',
        dataIndex: 'article12h',
        width: 130,
        align: 'center',
        render: (v, r) => renderNumber(v, 'article12h', r)
      },
      {
        title: 'Article 12h Point',
        dataIndex: 'article12hPoint',
        width: 180,
        align: 'center',
        render: (v, r) => renderNumber(v, 'article12hPoint', r)
      },
      {
        title: 'MarketPsych Earnings Dir Z',
        dataIndex: 'marketpsychEarningsDirectionZ',
        width: 208,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychEarningsDirectionZ', r)
      },
      {
        title: 'MarketPsych Earnings Dir Z Point',
        dataIndex: 'marketpsychEarningsDirectionZPoint',
        width: 246,
        align: 'center',
        render: (v, r) =>
          renderNumber(v, 'marketpsychEarningsDirectionZPoint', r)
      },
      {
        title: 'MarketPsych Earnings Forecast Z',
        dataIndex: 'marketpsychEarningsForecastZ',
        width: 248,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychEarningsForecastZ', r)
      },
      {
        title: 'MarketPsych Earnings Forecast Z Point',
        dataIndex: 'marketpsychEarningsForecastZPoint',
        width: 290,
        align: 'center',
        render: (v, r) =>
          renderNumber(v, 'marketpsychEarningsForecastZPoint', r)
      },
      {
        title: 'MarketPsych Revenue Dir Z',
        dataIndex: 'marketpsychRevenueDirectionZ',
        width: 210,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychRevenueDirectionZ', r)
      },
      {
        title: 'MarketPsych Revenue Dir Z Point',
        dataIndex: 'marketpsychRevenueDirectionZPoint',
        width: 248,
        align: 'center',
        render: (v, r) =>
          renderNumber(v, 'marketpsychRevenueDirectionZPoint', r)
      },
      {
        title: 'MarketPsych Revenue Forecast Z',
        dataIndex: 'marketpsychRevenueForecastZ',
        width: 248,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychRevenueForecastZ', r)
      },
      {
        title: 'MarketPsych Revenue Forecast Z Point',
        dataIndex: 'marketpsychRevenueForecastZPoint',
        width: 286,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychRevenueForecastZPoint', r)
      },
      {
        title: 'MarketPsych Price Up Z',
        dataIndex: 'marketpsychPriceUpZ',
        width: 184,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychPriceUpZ', r)
      },
      {
        title: 'MarketPsych Price Up Z Point',
        dataIndex: 'marketpsychPriceUpZPoint',
        width: 240,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychPriceUpZPoint', r)
      },
      {
        title: 'MarketPsych Optimism Z',
        dataIndex: 'marketpsychOptimismZ',
        width: 190,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychOptimismZ', r)
      },
      {
        title: 'MarketPsych Optimism Z Point',
        dataIndex: 'marketpsychOptimismZPoint',
        width: 230,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychOptimismZPoint', r)
      },
      {
        title: 'MarketPsych Trust Z',
        dataIndex: 'marketpsychTrustZ',
        width: 164,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychTrustZ', r)
      },
      {
        title: 'MarketPsych Trust Z Point',
        dataIndex: 'marketpsychTrustZPoint',
        width: 200,
        align: 'center',
        render: (v, r) => renderNumber(v, 'marketpsychTrustZPoint', r)
      },
      {
        title: 'Note for Trader',
        dataIndex: 'noteForTrader',
        width: 130,
        align: 'center',
        render: (v, r) => renderText(v, 'noteForTrader', r)
      },
      {
        title: 'Forecast',
        dataIndex: 'forecast',
        width: 120,
        align: 'center',
        render: (v, r) => {
          if (editingId === r.id) {
            return (
              <div
                style={{ display: 'flex', gap: 6, justifyContent: 'center' }}
              >
                {FORECAST_COLORS.map((color) => {
                  const active = editingRow.forecast === color;
                  return (
                    <div
                      key={color}
                      onClick={() =>
                        setEditingRow((prev) => ({ ...prev, forecast: color }))
                      }
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: active ? '1px solid #3d3d3d' : '1px solid #ccc'
                      }}
                    />
                  );
                })}
              </div>
            );
          }
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
        width: editingId ? 260 : 170,
        align: 'center',
        fixed: !isMobile && 'right',
        render: renderAction
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      t,
      isMobile,
      editingId,
      editingRow,
      renderNumber,
      renderText,
      renderDate,
      saveEdit,
      dispatch
    ]
  );

  return (
    <div css={rootStyles}>
      <EstForecastFilter onFilter={handleFilter} />

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
