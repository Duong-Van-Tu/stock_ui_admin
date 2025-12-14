/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetState,
  watchFinnhubAndLsegNewsLoading,
  watchFinnhubAndLsegNews,
  watchFinnhubAndLsegNewsPagination,
  getFinnhubAndLsegNews
} from '@/redux/slices/sentiment.slice';
import { Button, Table, TableColumnsType } from 'antd';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { convertSortType } from '@/utils/sort-table';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  isNumeric,
  isUrl,
  roundToDecimals
} from '@/utils/common';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { TableTitle } from './title.table';
import { useSearchParams } from 'next/navigation';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { isMobile } from 'react-device-detect';
import { FinnhubAndLsegNewsFilter } from '../filters/finnhub-lseg-news.filter';
import { DateTimeCell } from './columns/date-time-cell.column';
import EllipsisText from '../ellipsis-text';
import { SymbolCell } from './columns/symbol-cell.column';
import { useModal } from '@/hooks/modal.hook';
import { SentimentSCore } from '../charts/sentiment-score.chart';
import { useTranslations } from 'next-intl';

export const FinnhubAndLsegNewsTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');
  const sourceType = searchParams.get('sourceType');
  const isLseg = sourceType === 'lseg';
  const { height } = useWindowSize();
  const modal = useModal();

  const loading = useAppSelector(watchFinnhubAndLsegNewsLoading);
  const listNews = useAppSelector(watchFinnhubAndLsegNews);
  const pagination = useAppSelector(watchFinnhubAndLsegNewsPagination);

  const [filter, setFilter] = useState<SentimentFilter>({});

  const { sortField, sortType, handleSortOrder } = useSortOrder({
    defaultField: 'datetime',
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
        getFinnhubAndLsegNews({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          symbol: symbol ?? undefined,
          ...filteredFilter
        })
      );
    },
    [symbol, dispatch, sortField, sortType]
  );

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  const handleFilter = (values: SentimentFilter) => {
    const newFilter = { ...filter, ...values };
    setFilter(newFilter);
    fetchListNews({ filter: newFilter });
  };

  const dataSource = Array.isArray(listNews) ? listNews : [];

  const columns: TableColumnsType<FinnhubAndLsegNewsTableItem> = useMemo(
    () => [
      {
        title: t('stt'),
        dataIndex: 'index',
        key: 'index',
        width: 70,
        align: 'center',
        fixed: !isMobile && 'left',
        render: (_v, _r, index) =>
          index + 1 + (pagination.currentPage - 1) * pagination.pageSize
      },
      {
        title: 'Symbol',
        dataIndex: 'symbol',
        key: 'symbol',
        width: 90,
        fixed: !isMobile && 'left',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'symbol' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('symbol')
        }),
        render: (value) => <SymbolCell symbol={value} />
      },
      {
        title: 'Source',
        dataIndex: 'sourceType',
        key: 'sourceType',
        width: 86,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'sourceType' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('sourceType')
        }),
        align: 'center'
      },
      {
        title: 'Publishing Time',
        dataIndex: 'datetime',
        key: 'datetime',
        width: 150,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'datetime' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('datetime')
        }),
        align: 'center',
        render: (value) => (value ? <DateTimeCell value={value} /> : '-')
      },
      {
        title: 'Headline',
        dataIndex: 'headline',
        key: 'headline',
        width: 180,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'headline' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('headline')
        }),
        render: (value) =>
          value ? <EllipsisText text={value} maxLines={2} /> : '-'
      },
      {
        title: 'Story',
        dataIndex: 'summary',
        key: 'summary',
        width: 68,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'summary' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('summary')
        }),
        align: 'center',
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
      },
      {
        title: 'Relevance',
        dataIndex: 'newsRelevance',
        key: 'newsRelevance',
        width: 120,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'newsRelevance' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('newsRelevance')
        }),
        align: 'center'
      },
      {
        title: 'Direction',
        dataIndex: 'direction',
        key: 'direction',
        width: 90,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'direction' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('direction')
        }),
        align: 'center',
        render: (value) => (value ? value : '-')
      },
      {
        title: 'Horizon',
        dataIndex: 'horizon',
        key: 'horizon',
        width: 100,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'horizon' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('horizon')
        }),
        align: 'center',
        render: (value) => value ?? '-'
      },
      {
        title: 'News Type',
        dataIndex: 'newsType',
        key: 'newsType',
        width: 140,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'newsType' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('newsType')
        }),
        align: 'center',
        render: (value) => value ?? '-'
      },
      {
        title: 'Article Score',
        dataIndex: 'articleScore',
        key: 'articleScore',
        width: 140,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'articleScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('articleScore')
        }),
        align: 'center',
        hidden: isLseg,
        render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
      },
      {
        title: 'Time Weight',
        dataIndex: 'timeWeight',
        key: 'timeWeight',
        width: 130,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'timeWeight' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('timeWeight')
        }),
        align: 'center',
        hidden: isLseg,
        render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
      },
      {
        title: 'Weighted Score',
        dataIndex: 'weightedScore',
        key: 'weightedScore',
        width: 150,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'weightedScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('weightedScore')
        }),
        align: 'center',
        hidden: isLseg,
        render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
      },
      {
        title: 'URL',
        dataIndex: 'url',
        key: 'url',
        width: 60,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'url' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('url')
        }),
        hidden: isLseg,
        render: (value) =>
          isUrl(value) ? (
            <a href={value} target='_blank' rel='noopener noreferrer'>
              Open
            </a>
          ) : (
            '-'
          )
      },
      {
        title: 'News Score',
        dataIndex: 'newsScore',
        key: 'newsScore',
        width: 120,
        fixed: !isMobile && 'right',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'newsScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('newsScore')
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
      }
    ],
    [
      isLseg,
      pagination.currentPage,
      pagination.pageSize,
      sortField,
      sortType,
      handleSortOrder,
      modal
    ]
  );

  return (
    <div css={rootStyles}>
      <div css={filterBarStyles}>
        <FinnhubAndLsegNewsFilter onFilter={handleFilter} />
      </div>
      <div css={tableWrapperStyles}>
        <TableTitle customStyles={titleStyles}>Finnhub & LSEG News</TableTitle>
        <Table<any>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          scroll={{
            x: 1200,
            y: dataSource.length > 0 ? height - 314 : undefined
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
