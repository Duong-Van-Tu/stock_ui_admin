/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Table, TableColumnsType, Button, Space, Tooltip } from 'antd';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  watchEstForecastLoading,
  getEstForecastFilterPaging,
  deleteEstForecast,
  watchEstForecastFilterList,
  watchEstForecastPagination
} from '@/redux/slices/est-forecast.slice';
import { useEffect, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import { DateTimeCell } from './columns/date-time-cell.column';
import { isNumeric, roundToDecimals } from '@/utils/common';
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

  const handleGoBack = () => {
    router.push(PageURLs.ofEstForecast());
  };

  const handlePageChange = (page: number, pageSize: number) => {
    dispatch(
      getEstForecastFilterPaging({
        page: page,
        limit: pageSize
      })
    );
  };

  useEffect(() => {
    dispatch(
      getEstForecastFilterPaging({
        page: pagination.currentPage,
        limit: pagination.pageSize
      })
    );
  }, [dispatch, pagination.currentPage, pagination.pageSize]);

  const columns: TableColumnsType<EstForecast> = useMemo(
    () => [
      {
        title: t('stt'),
        dataIndex: 'index',
        key: 'index',
        width: 60,
        align: 'center',
        fixed: 'left',
        render: (_, __, index) =>
          index + 1 + (pagination.currentPage - 1) * pagination.pageSize
      },
      {
        title: t('symbol'),
        dataIndex: 'symbol',
        key: 'symbol',
        width: isMobile ? 110 : 160,
        fixed: 'left',
        render: (_, record) => (
          <SymbolCell
            symbol={record.symbol}
            companyName={isMobile ? undefined : record.company}
          />
        )
      },

      {
        title: 'Industry',
        dataIndex: 'industry',
        key: 'industry',
        width: 160
      },
      {
        title: t('epsEstimate'),
        dataIndex: 'epsEstimate',
        key: 'epsEstimate',
        width: 120,
        align: 'center',
        render: (value) =>
          value ? (
            <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
              <span>{roundToDecimals(value, 2)}</span>
            </PositiveNegativeText>
          ) : (
            <span>-</span>
          )
      },
      {
        title: t('epsActual'),
        dataIndex: 'reportedEps',
        key: 'reportedEps',
        width: 120,
        align: 'center',
        render: (value) =>
          value ? (
            <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
              <span>{roundToDecimals(value, 2)}</span>
            </PositiveNegativeText>
          ) : (
            <span>-</span>
          )
      },
      {
        title: 'Surprise',
        dataIndex: 'surprise',
        key: 'surprise',
        width: 110,
        align: 'center',
        render: (value) =>
          value ? (
            <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
              <span>{roundToDecimals(value, 2)}%</span>
            </PositiveNegativeText>
          ) : (
            <span>-</span>
          )
      },

      {
        title: 'Price Target',
        dataIndex: 'priceTarget',
        key: 'priceTarget',
        width: 120,
        align: 'center',
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: t('aiRating'),
        dataIndex: 'aiRating',
        key: 'aiRating',
        width: 100,
        align: 'center',
        render: (value) => (value ? roundToDecimals(value) : '-')
      },

      {
        title: t('totalScore'),
        dataIndex: 'totalScoreEstForecast',
        key: 'totalScoreEstForecast',
        width: 120,
        render: (value) =>
          isNumeric(value) ? (
            <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
              <span>{roundToDecimals(value, 2)}</span>
            </PositiveNegativeText>
          ) : (
            '-'
          )
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
        width: 180,
        align: 'center',
        fixed: !isMobile && 'right',
        render: (_, record) => (
          <Space>
            <Button type='primary' size='small'>
              Edit
            </Button>
            <Button
              danger
              size='small'
              onClick={() => dispatch(deleteEstForecast(record.id!))}
            >
              Delete
            </Button>
          </Space>
        )
      }
    ],
    [dispatch]
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

        <Table<EstForecast>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey='id'
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
  gap: 0.4rem;
  padding: 1.2rem 1rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;
