/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getFinnhubAndLsegNews,
  resetState,
  watchFinnhubAndLsegNews,
  watchFinnhubAndLsegNewsLoading,
  watchFinnhubAndLsegNewsPagination
} from '@/redux/slices/sentiment.slice';
import { Button, Table, TableColumnsType } from 'antd';
import { EmptyDataTable } from '../tables/empty.table';
import { useCallback, useEffect, useMemo } from 'react';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { DateTimeCell } from '../tables/columns/date-time-cell.column';
import { isNumeric, roundToDecimals } from '@/utils/common';
import EllipsisText from '../ellipsis-text';
import { isMobile } from 'react-device-detect';
import { PositiveNegativeText } from '../positive-negative-text';
import { useModal } from '@/hooks/modal.hook';

type CompanyNewsProps = {
  symbol: string;
  fromDate?: string;
  toDate?: string;
};

export const CompanyNews = ({ symbol, fromDate, toDate }: CompanyNewsProps) => {
  const dispatch = useAppDispatch();
  const modal = useModal();
  const listNews = useAppSelector(watchFinnhubAndLsegNews);
  const loading = useAppSelector(watchFinnhubAndLsegNewsLoading);
  const pagination = useAppSelector(watchFinnhubAndLsegNewsPagination);

  const fetchCompanyNews = useCallback(
    ({ page = PAGINATION_PARAMS.offset, pageSize = 5 }: PageChangeParams) => {
      dispatch(
        getFinnhubAndLsegNews({
          symbol,
          startDate: fromDate,
          endDate: toDate,
          page,
          limit: pageSize
        })
      );
    },
    [dispatch, symbol, fromDate, toDate]
  );

  useEffect(() => {
    fetchCompanyNews({});
    return () => {
      dispatch(resetState());
    };
  }, [fetchCompanyNews, dispatch]);

  const columns: TableColumnsType<FinnhubAndLsegNewsTableItem> = useMemo(
    () => [
      {
        title: 'Publishing Time',
        dataIndex: 'datetime',
        key: 'datetime',
        width: 150,
        align: 'center',
        fixed: !isMobile && 'left',
        render: (value) => (value ? <DateTimeCell value={value} /> : '-')
      },
      {
        title: 'Headline',
        dataIndex: 'headline',
        key: 'headline',
        width: 180,
        render: (value) => <EllipsisText text={value} maxLines={2} />
      },
      {
        title: 'Source',
        dataIndex: 'sourceType',
        key: 'sourceType',
        width: 86,
        align: 'center'
      },
      {
        title: 'News Type',
        dataIndex: 'newsType',
        key: 'newsType',
        width: 180,
        align: 'center',
        render: (value) =>
          value ? <EllipsisText text={value} maxLines={2} /> : '-'
      },
      {
        title: 'Article Score',
        dataIndex: 'articleScore',
        key: 'articleScore',
        width: 140,
        align: 'center',

        render: (value) =>
          isNumeric(value) ? roundToDecimals(value) : '-'
      },
      {
        title: 'Impact Score',
        dataIndex: 'impactScore',
        key: 'impactScore',
        width: 130,
        align: 'center',
        render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
      },
      {
        title: 'Sentiment Score',
        dataIndex: 'newsScore',
        key: 'newsScore',
        width: 150,
        align: 'center',
        render: (value) =>
          isNumeric(value) ? (
            <PositiveNegativeText isNegative={value < 0} isPositive={value > 0}>
              {roundToDecimals(value)}
            </PositiveNegativeText>
          ) : (
            '-'
          )
      },
      {
        title: 'Sector',
        dataIndex: 'sector',
        key: 'sector',
        width: 180,
        render: (value) =>
          value ? <EllipsisText text={value} maxLines={2} /> : '-'
      },
      {
        title: 'Industry',
        dataIndex: 'industry',
        key: 'industry',
        width: 180,
        render: (value) =>
          value ? <EllipsisText text={value} maxLines={2} /> : '-'
      },
      {
        title: 'Direction',
        dataIndex: 'direction',
        key: 'direction',
        width: 90,
        align: 'center',
        render: (value) => (value ? value : '-')
      },
      {
        title: 'Horizon',
        dataIndex: 'horizon',
        key: 'horizon',
        width: 100,
        align: 'center',
        render: (value) => value ?? '-'
      },
      {
        title: 'Relevance',
        dataIndex: 'newsRelevance',
        key: 'newsRelevance',
        width: 120,
        align: 'center'
      },
      {
        title: 'Grok Rating',
        dataIndex: 'grokRating',
        key: 'grokRating',
        width: 120,
        align: 'center',
        render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
      },
      {
        title: 'Grok Recommendation',
        dataIndex: 'grokRec',
        key: 'grokRec',
        width: 180,
        align: 'center',
        render: (value) =>
          value ? (
            <PositiveNegativeText
              isPositive={`${value}`.toUpperCase() === 'BUY'}
              isNegative={`${value}`.toUpperCase() === 'SELL'}
            >
              <span>{`${value}`.toUpperCase()}</span>
            </PositiveNegativeText>
          ) : (
            '-'
          )
      },
      {
        title: 'Story',
        dataIndex: 'summary',
        key: 'summary',
        width: 68,
        align: 'center',
        fixed: !isMobile && 'right',
        render: (value, record) =>
          value ? (
            <Button
              onClick={() =>
                modal.openModal(
                  <div css={storyStyles}>
                    <h2>{`News Story (${record.symbol})`}</h2>
                    <h3>{record.headline}</h3>
                    <p dangerouslySetInnerHTML={{ __html: value }} />
                  </div>,
                  { width: 1000 }
                )
              }
              type='link'
              block
            >
              Story
            </Button>
          ) : (
            '-'
          )
      }
    ],
    []
  );

  return (
    <Table<FinnhubAndLsegNewsTableItem>
      size={isMobile ? 'small' : 'middle'}
      bordered={false}
      css={tableStyles}
      loading={loading}
      rowKey={(record) => record.key}
      columns={columns}
      dataSource={listNews}
      showHeader={listNews?.length > 0}
      scroll={listNews.length > 0 ? { x: 600, y: undefined } : undefined}
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
  .ant-table-header,
  .ant-table-thead > tr > th,
  .ant-table-thead > tr > td {
    background: var(--table-header-bg-color) !important;
  }

  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }

  .ant-table-thead {
    .ant-table-cell {
      background: var(--table-header-bg-color) !important;

      &.ant-table-cell-fix-left,
      &.ant-table-cell-fix-right,
      &.ant-table-cell-fix-left-last,
      &.ant-table-cell-fix-right-first {
        background: var(--table-header-bg-color) !important;
      }

      &:first-of-type {
        border-start-start-radius: 0 !important;
      }

      &:last-child {
        border-start-end-radius: 0 !important;
      }
    }
  }
`;

const emptyStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem 0;
`;

const storyStyles = css`
  h2 {
    text-align: center;
  }

  h3 {
    font-size: 2rem;
    line-height: 2.4rem;
    margin-bottom: 0.4rem;
  }

  p {
    margin-bottom: 0;
  }
`;
