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
import { Button, Table, TableColumnsType, Tooltip } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { convertSortType } from '@/utils/sort-table';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { cleanFalsyValues, getTextColor, isNumeric } from '@/utils/common';
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
import { Icon } from '../icons';
import { ListNewsFilter } from '../filters/list-news.filter';

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

  const [filter, setFilter] = useState<SentimentFilter>({});

  const { sortField, sortType, handleSortOrder } =
    useSortOrder<SentimentFilter>({
      defaultField: 'versionCreated',
      defaultOrder: 'descend',
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
  }, [fetchListNews, dispatch]);

  const handleFilter = (values: {
    fromDate?: string;
    toDate?: string;
    urgency?: number[];
  }) => {
    const next = { ...filter, ...values };
    setFilter(next);
    console.log('next filter', next);
    fetchListNews({
      page: PAGINATION.currentPage,
      pageSize: pagination.pageSize,
      filter: next
    });
  };

  const columns: TableColumnsType<NewsSentiment> = [
    {
      title: t('stt'),
      dataIndex: 'index',
      key: 'index',
      width: 64,
      align: 'center',
      fixed: !isMobile && 'left',
      render: (_, __, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: t('source'),
      dataIndex: 'source',
      key: 'source',
      width: 100,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'source' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('source')
      }),
      align: 'center'
    },
    {
      title: t('publishingTime'),
      dataIndex: 'versionCreated',
      key: 'versionCreated',
      width: 160,
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
      title: t('symbol'),
      dataIndex: 'symbols',
      key: 'symbols',
      width: 110,
      render: (value, record) => (
        <div css={symbolColumnStyles}>
          <div css={listSymbolStyles}>
            {value.map((symbol: string) => (
              <SymbolCell
                key={symbol}
                symbolColor={
                  isNumeric(record.sentiment)
                    ? getTextColor(record.sentiment)
                    : undefined
                }
                symbol={symbol}
              />
            ))}
          </div>
        </div>
      )
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
      render: (value, record) => (
        <div css={titleCellStyles}>
          {(record.urgency === 1 || record.urgency === 2) && (
            <Tooltip
              css={fireIconStyles}
              title={isMobile ? null : t('breakingNews')}
            >
              <Button
                type='text'
                icon={<Icon icon='fire' width={18} height={18} />}
                shape='circle'
              />
            </Tooltip>
          )}
          <EllipsisText text={value} maxLines={2} />
        </div>
      )
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
      hidden: true,
      render: (value) =>
        isNumeric(value) ? (
          <div css={sentimentScoreStyles}>
            <SentimentSCore score={value} />
          </div>
        ) : (
          '-'
        )
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={filterBarStyles}>
        <ListNewsFilter onFilter={handleFilter} />
      </div>
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
            y: listNews.length > 0 ? height - 314 : undefined
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

const filterBarStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.6rem;
  padding: 1.6rem 1.4rem 1.2rem;
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

const symbolColumnStyles = css`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const listSymbolStyles = css`
  display: flex;
  flex-direction: column;
  max-height: 10.4rem;
  overflow-y: auto;
`;

const titleCellStyles = css`
  position: relative;
  padding-left: 1rem;
`;

const fireIconStyles = css`
  position: absolute;
  left: -1.8rem;
  top: -1.4rem;
`;
