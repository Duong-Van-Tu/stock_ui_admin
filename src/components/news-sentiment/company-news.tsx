/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getCompanyNews,
  watchCompanyNews,
  watchCompanyNewsLoading,
  watchCompanyNewsPagination
} from '@/redux/slices/sentiment.slice';
import { Table, TableColumnsType } from 'antd';
import { EmptyDataTable } from '../tables/empty.table';
import { useCallback, useEffect } from 'react';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { DateTimeCell } from '../tables/columns/date-time-cell.column';
import { PositiveNegativeText } from '../positive-negative-text';
import { roundToDecimals } from '@/utils/common';
import { useTranslations } from 'next-intl';

type CompanyNewsProps = {
  symbol: string;
  fromDate?: string;
  toDate?: string;
};

export const CompanyNews = ({ symbol, fromDate, toDate }: CompanyNewsProps) => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const companyNews = useAppSelector(watchCompanyNews);
  const loading = useAppSelector(watchCompanyNewsLoading);
  const pagination = useAppSelector(watchCompanyNewsPagination);

  const fetchCompanyNews = useCallback(
    ({ page = PAGINATION_PARAMS.offset, pageSize = 5 }: PageChangeParams) => {
      dispatch(
        getCompanyNews({
          symbol,
          query: { fromDate, toDate, page, limit: pageSize }
        })
      );
    },
    [dispatch, symbol, fromDate, toDate]
  );

  useEffect(() => {
    fetchCompanyNews({});
  }, [fetchCompanyNews]);

  const columns: TableColumnsType<CompanyNews> = [
    {
      title: t('timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 120,
      fixed: 'left',
      align: 'center',
      render: (value) => <DateTimeCell value={value} />
    },
    {
      title: t('sentimentScore'),
      dataIndex: 'sentimentScore',
      key: 'sentimentScore',
      width: 150,
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('sentimentScore1w'),
      dataIndex: 'sentimentScore1w',
      key: 'sentimentScore1w',
      width: 150,
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('impact'),
      dataIndex: 'impact',
      key: 'impact',
      width: 120,
      align: 'center'
    },
    {
      title: t('source'),
      dataIndex: 'source',
      key: 'source',
      width: 120,
      align: 'center',
      render: (value, record) => (
        <div>
          {value} <br />
          <a href={record.url} target='_blank'>
            {t('viewDetails')}
          </a>
        </div>
      )
    },
    {
      title: t('sentiment'),
      dataIndex: 'sentiment',
      key: 'sentiment',
      width: 140,
      align: 'center',
      fixed: 'right',
      render: (value) =>
        value ? (
          <PositiveNegativeText
            isPositive={value === 'positive' || value === 'very_positive'}
            isNegative={value === 'negative' || value === 'very_negative'}
          >
            <span>{value}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    }
  ];

  return (
    <Table<CompanyNews>
      bordered={false}
      css={tableStyles}
      loading={loading}
      rowKey={(record) => record.key}
      columns={columns}
      dataSource={companyNews}
      showHeader={companyNews?.length > 0}
      scroll={companyNews.length > 0 ? { x: 600, y: undefined } : undefined}
      sortDirections={['descend', 'ascend']}
      locale={{
        emptyText: (
          <div css={emptyStyles}>
            <EmptyDataTable />
          </div>
        )
      }}
      pagination={
        pagination.total > 5
          ? {
              position: ['bottomCenter'],
              showSizeChanger: false,
              current: pagination.currentPage,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => {
                fetchCompanyNews({ page, pageSize });
              }
            }
          : false
      }
    />
  );
};

const tableStyles = css`
  .ant-table-thead {
    .ant-table-cell {
      background: var(--blue-100);
    }
  }
`;

const emptyStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem 0;
`;
