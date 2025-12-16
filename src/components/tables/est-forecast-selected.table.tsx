/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  Table,
  TableColumnsType,
  Button,
  Space,
  Tooltip,
  Input,
  InputNumber,
  DatePicker
} from 'antd';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchEstForecastLoading,
  getEstForecastFilterPaging,
  deleteEstForecast,
  watchEstForecastFilterList,
  watchEstForecastPagination,
  updateEstForecast
} from '@/redux/slices/est-forecast.slice';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { isMobile } from 'react-device-detect';
import { DateTimeCell } from './columns/date-time-cell.column';
import { formatMarketCap, isNumeric, roundToDecimals } from '@/utils/common';
import { TableTitle } from './title.table';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '../icons';
import { PageURLs } from '@/utils/navigate';
import { PositiveNegativeText } from '../positive-negative-text';
import { SymbolCell } from './columns/symbol-cell.column';

export const EstForecastSelectedTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const loading = useAppSelector(watchEstForecastLoading);
  const filterList = useAppSelector(watchEstForecastFilterList);
  const pagination = useAppSelector(watchEstForecastPagination);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<Partial<EstForecastFilterItem>>(
    {}
  );

  const handleGoBack = () => {
    router.push(PageURLs.ofEstForecast());
  };

  const handlePageChange = (page: number, pageSize: number) => {
    dispatch(getEstForecastFilterPaging({ page, limit: pageSize }));
  };

  useEffect(() => {
    dispatch(
      getEstForecastFilterPaging({
        page: pagination.currentPage,
        limit: pagination.pageSize
      })
    );
  }, [dispatch, pagination.currentPage, pagination.pageSize]);

  const startEdit = (record: EstForecastFilterItem) => {
    setEditingId(record.id!);
    setEditingRow(record);
  };

  const saveEdit = useCallback(() => {
    if (!editingId) return;

    dispatch(
      updateEstForecast({
        id: editingId,
        payload: editingRow as any
      })
    );

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
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {roundToDecimals(value, 2)}
          {suffix}
        </PositiveNegativeText>
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
            showTime
            style={{ width: '100%' }}
            onChange={(d) =>
              setEditingRow((prev) => ({
                ...prev,
                [field]: d ? d.toISOString() : null
              }))
            }
          />
        );
      }

      return value ? <DateTimeCell value={value} /> : '-';
    },
    [editingId, editingRow]
  );

  const columns: TableColumnsType<EstForecastFilterItem> = useMemo(
    () => [
      {
        title: t('stt'),
        width: 60,
        align: 'center',
        fixed: 'left',
        render: (_, __, index) =>
          index + 1 + (pagination.currentPage - 1) * pagination.pageSize
      },
      {
        title: t('symbol'),
        dataIndex: 'symbol',
        width: isMobile ? 110 : 160,
        fixed: 'left',
        render: (_, record) => (
          <SymbolCell
            symbol={record.symbol}
            companyName={isMobile ? undefined : record.company}
          />
        )
      },
      { title: 'Industry', dataIndex: 'industry', width: 160 },
      {
        title: 'Market Cap',
        dataIndex: 'marketCapEstForecast',
        width: 110,
        align: 'center',
        render: (v) => (v ? formatMarketCap(v / 1_000_000) : '-')
      },
      {
        title: t('epsEstimate'),
        dataIndex: 'epsEstimate',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'epsEstimate', r)
      },
      {
        title: t('epsActual'),
        dataIndex: 'reportedEps',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'reportedEps', r)
      },
      {
        title: 'Surprise',
        dataIndex: 'surprise',
        width: 110,
        align: 'center',
        render: (v, r) => renderNumber(v, 'surprise', r, '%')
      },
      {
        title: 'YTD %',
        dataIndex: 'ytdPerformance',
        width: 110,
        align: 'center',
        render: (v, r) => renderNumber(v, 'ytdPerformance', r, '%')
      },
      {
        title: 'Price Target',
        dataIndex: 'priceTarget',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'priceTarget', r)
      },
      {
        title: t('aiRating'),
        dataIndex: 'aiRating',
        width: 100,
        align: 'center',
        render: (v, r) => renderNumber(v, 'aiRating', r)
      },
      {
        title: t('totalScore'),
        dataIndex: 'totalScoreEstForecast',
        width: 120,
        align: 'center',
        render: (v, r) => renderNumber(v, 'totalScoreEstForecast', r)
      },
      {
        title: 'Router Recommendation',
        dataIndex: 'routerRec',
        width: 140,
        align: 'center',
        render: (v, r) => renderText(v, 'routerRec', r)
      },
      {
        title: 'Yahoo Recommendation',
        dataIndex: 'yahooRec',
        width: 140,
        align: 'center',
        render: (v, r) => renderText(v, 'yahooRec', r)
      },
      {
        title: 'Call Time',
        dataIndex: 'callTime',
        width: 204,
        align: 'center',
        render: (v, r) => renderDate(v, 'callTime', r)
      },
      {
        title: 'Growth',
        dataIndex: 'growth',
        width: 100,
        align: 'center',
        render: (v, r) => renderText(v, 'growth', r)
      },
      {
        title: 'GPT',
        dataIndex: 'gpt',
        width: 100,
        align: 'center',
        render: (v, r) => renderText(v, 'gpt', r)
      },
      {
        title: 'Forecast',
        dataIndex: 'forecast',
        width: 120,
        align: 'center',
        render: (v, r) => renderText(v, 'forecast', r)
      },
      {
        title: 'EPS Point',
        dataIndex: 'epsEstimatePoint',
        width: 100,
        align: 'center',
        render: (v, r) => renderNumber(v, 'epsEstimatePoint', r)
      },
      {
        title: 'AI Point',
        dataIndex: 'aiRatingPoint',
        width: 100,
        align: 'center',
        render: (v, r) => renderNumber(v, 'aiRatingPoint', r)
      },
      {
        title: 'Total Score Point',
        dataIndex: 'totalScorePoint',
        width: 138,
        align: 'center',
        render: (v, r) => renderNumber(v, 'totalScorePoint', r)
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        width: 204,
        align: 'center',
        render: (v, r) => renderDate(v, 'createdAt', r)
      },
      {
        title: 'Updated',
        dataIndex: 'updatedAt',
        width: 204,
        align: 'center',
        render: (v, r) => renderDate(v, 'updatedAt', r)
      },
      {
        title: 'Action',
        width: 160,
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
              onClick={() => dispatch(deleteEstForecast(record.id!))}
            >
              Delete
            </Button>
          </Space>
        )
      }
    ],
    [
      t,
      pagination.currentPage,
      pagination.pageSize,
      editingId,
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
          <Tooltip title={isMobile ? null : t('back')}>
            <Button
              shape='circle'
              type='text'
              icon={<Icon icon='back' width={18} height={18} />}
              onClick={handleGoBack}
            />
          </Tooltip>
          <TableTitle>Selected Est Forecast</TableTitle>
        </div>

        <Table
          rowKey='id'
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          columns={columns}
          dataSource={filterList}
          loading={loading}
          scroll={{ x: 2000 }}
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
  gap: 0.4rem;
  padding: 1.2rem 1rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;
