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
  watchEstForecastFilterLoading,
  getEstForecastFilterPaging,
  deleteEstForecast,
  watchEstForecastFilterList,
  watchEstForecastPagination,
  updateEstForecast,
  watchEstForecastAddSuccess,
  resetAddEstForecastState
} from '@/redux/slices/est-forecast.slice';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { isMobile } from 'react-device-detect';
import { formatMarketCap, isNumeric, roundToDecimals } from '@/utils/common';
import { TableTitle } from './title.table';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SymbolCell } from './columns/symbol-cell.column';
import { useModal } from '@/hooks/modal.hook';
import { EstForecastTable } from './est-forecast.table';

const { RangePicker } = DatePicker;

const FORECAST_COLORS = ['#52c41a', '#fadb14', '#fa8c16', '#ff4d4f'];

export const EstForecastSelectedTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { openModal } = useModal();

  const loading = useAppSelector(watchEstForecastFilterLoading);
  const filterList = useAppSelector(watchEstForecastFilterList);
  const pagination = useAppSelector(watchEstForecastPagination);
  const addSuccess = useAppSelector(watchEstForecastAddSuccess);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<Partial<EstForecastFilterItem>>(
    {}
  );
  const [searchValue, setSearchValue] = useState('');

  const now = dayjs();
  const defaultStartDate = now.subtract(2, 'day').startOf('day');
  const defaultEndDate = now.endOf('day');

  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    defaultStartDate,
    defaultEndDate
  ]);

  const handleSearch = (value: string) => {
    if (!value) return;
    setSearchValue(value);
    openModal(<EstForecastTable symbol={value} />, { width: 1600 });
  };

  const handlePageChange = (page: number, pageSize: number) => {
    const symbol = searchParams.get('symbol') || undefined;
    dispatch(
      getEstForecastFilterPaging({
        page,
        limit: pageSize,
        symbol,
        startDate: dayjs(dateRange[0]).add(1, 'day').toISOString(),
        endDate: dayjs(dateRange[1]).add(1, 'day').toISOString()
      })
    );
  };

  useEffect(() => {
    const symbol = searchParams.get('symbol') || undefined;
    dispatch(
      getEstForecastFilterPaging({
        page: pagination.currentPage,
        limit: pagination.pageSize,
        symbol,
        startDate: dayjs(dateRange[0]).add(1, 'day').toISOString(),
        endDate: dayjs(dateRange[1]).add(1, 'day').toISOString(),
        sortField: 'earnings_date',
        sortType: 'desc'
      })
    );
  }, [
    dispatch,
    pagination.currentPage,
    pagination.pageSize,
    searchParams,
    dateRange
  ]);

  useEffect(() => {
    if (addSuccess) {
      dispatch(
        getEstForecastFilterPaging({
          page: 1,
          limit: 100,
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
          sortField: 'earnings_date',
          sortType: 'desc'
        })
      );
      dispatch(resetAddEstForecastState());
    }
  }, [dispatch, addSuccess, dateRange]);

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
      field: keyof EstForecastFilterItem,
      record: EstForecastFilterItem,
      suffix?: string
    ) => {
      if (editingId === record.id) {
        return (
          <InputNumber
            value={editingRow[field] as number}
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
      field: keyof EstForecastFilterItem,
      record: EstForecastFilterItem
    ) => {
      if (editingId === record.id) {
        return (
          <Input
            value={editingRow[field] as string}
            onChange={(e) =>
              setEditingRow((prev) => ({
                ...prev,
                [field]: e.target.value
              }))
            }
          />
        );
      }
      return value || '-';
    },
    [editingId, editingRow]
  );

  const renderDate = useCallback(
    (
      value: string | undefined,
      field: keyof EstForecastFilterItem,
      record: EstForecastFilterItem
    ) => {
      if (editingId === record.id) {
        const currentValue = (editingRow[field] as string | undefined) ?? value;
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
          />
        )
      },
      {
        title: 'Earnings Date',
        dataIndex: 'earningsDate',
        width: 150,
        align: 'center',
        render: (v, r) => renderDate(v, 'earningsDate', r)
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
        render: (v) => (v ? formatMarketCap(v / 1_000_000) : '-')
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
        render: (v, r) => renderNumber(v, 'revenueForecast', r)
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
        title: 'Actions',
        width: 170,
        align: 'center',
        fixed: !isMobile && 'right',
        render: (_, record) => (
          <Space>
            {editingId === record.id ? (
              <Button
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                type='primary'
                onClick={saveEdit}
              >
                Save
              </Button>
            ) : (
              <Button type='primary' onClick={() => startEdit(record)}>
                Edit
              </Button>
            )}
            <Button
              danger
              onClick={() => dispatch(deleteEstForecast(record.id))}
            >
              Delete
            </Button>
          </Space>
        )
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
      <div css={tableWrapperStyles}>
        <div css={titleRowStyles}>
          <TableTitle>Earnings Strategy</TableTitle>
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(v) => v && setDateRange(v as any)}
            />
            <Input.Search
              placeholder='Search to add to Est Forecast'
              enterButton='Search'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
              onSearch={handleSearch}
              allowClear
              style={{ width: 320 }}
            />
          </Space>
        </div>

        <Table
          rowKey={(record) => record.key!}
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          columns={columns}
          dataSource={filterList}
          loading={loading}
          scroll={{ x: 1200 }}
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
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const titleRowStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  padding: 1.2rem 1rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;
