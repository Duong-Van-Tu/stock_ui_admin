/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetState,
  watchListNewsLoading,
  watchListNews,
  watchListNewsPagination,
  getListNews
} from '@/redux/slices/sentiment.slice';
import { Button, Table, TableColumnsType } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { convertSortType } from '@/utils/sort-table';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { cleanFalsyValues, isNumeric } from '@/utils/common';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { SymbolCell } from './columns/symbol-cell.column';
import { DateTimeCell } from './columns/date-time-cell.column';
import EllipsisText from '../ellipsis-text';
import { TableTitle } from './title.table';
import { useSearchParams } from 'next/navigation';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { isMobile } from 'react-device-detect';
import { SentimentSCore } from '../charts/sentiment-score.chart';
import { useModal } from '@/hooks/modal.hook';

export const ListNewsTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');
  const { height } = useWindowSize();
  const modal = useModal();
  const loading = useAppSelector(watchListNewsLoading);
  const listNews = useAppSelector(watchListNews);
  const pagination = useAppSelector(watchListNewsPagination);

  const [filter, setFilter] = useState<Filter>({});

  const { sortField, sortType, handleSortOrder } = useSortOrder<Filter>({
    defaultField: 'symbol',
    defaultOrder: 'ascend',
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      setFilter(newFilter);
      fetchListNews({
        page: PAGINATION.currentPage,
        pageSize: pagination.pageSize,
        filter: newFilter
      });
    }
  });

  const fetchListNews = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getListNews({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          symbol: symbol ? symbol : undefined,
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol]
  );

  useEffect(() => {
    fetchListNews({});
    return () => {
      dispatch(resetState());
    };
  }, [fetchListNews]);

  const columns: TableColumnsType<NewsSentiment> = [
    {
      title: t('stt'),
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: !isMobile && 'left',
      render: (_, __, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      fixed: 'left',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'symbol' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('symbol')
      }),
      render: (_, record) => <SymbolCell symbol={record.symbol} />
    },
    {
      title: t('sentiment'),
      dataIndex: 'sentiment',
      key: 'sentiment',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'sentiment' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sentiment')
      }),
      align: 'center',
      render: (value) =>
        isNumeric(value) ? (
          <div css={sentimentScoreStyles}>
            <SentimentSCore score={value} />
          </div>
        ) : (
          '-'
        )
    },
    {
      title: t('publishingTime'),
      dataIndex: 'versionCreated',
      key: 'versionCreated',
      width: 180,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'versionCreated' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('versionCreated')
      }),
      align: 'center',
      render: (value) => <DateTimeCell value={value} />
    },
    {
      title: t('headline'),
      dataIndex: 'title',
      key: 'title',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'title' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('title')
      }),
      render: (value) => <EllipsisText text={value} maxLines={2} />
    },
    {
      title: t('story'),
      dataIndex: 'story',
      key: 'story',
      width: 120,
      align: 'center',
      render: (value, record) =>
        value ? (
          <Button
            onClick={() =>
              modal.openModal(
                <div css={storyStyles}>
                  <h2>{`${t('newsStory')} (${record.symbol})`}</h2>
                  <h3>{record.title}</h3>
                  <p dangerouslySetInnerHTML={{ __html: value }} />
                </div>,
                { width: 1000 }
              )
            }
            type='link'
            block
          >
            {t('newsStory')}
          </Button>
        ) : (
          '-'
        )
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        <TableTitle customStyles={titleStyles}>{t('news')}</TableTitle>
        <Table<NewsSentiment>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={listNews}
          loading={loading}
          scroll={{
            x: 1200,
            y: listNews.length > 0 ? height - 238 : undefined
          }}
          sortDirections={['descend', 'ascend']}
          locale={{
            emptyText: (
              <div css={emptyStyles(height - 400)}>
                <EmptyDataTable />
              </div>
            )
          }}
          pagination={{
            position: ['bottomCenter'],
            pageSizeOptions: [
              '10',
              '20',
              '50',
              '100',
              '200',
              '300',
              '400',
              '500'
            ],
            showSizeChanger: true,
            showQuickJumper: true,
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              fetchListNews({ page, pageSize, filter });
            }
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

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const titleStyles = css`
  padding: 1.2rem 1.6rem;
`;

const sentimentScoreStyles = css`
  height: 4.6rem;
  text-align: center;
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
