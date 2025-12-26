/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetState,
  watchNewsScoresLoading,
  watchNewsScores,
  watchNewsScoresPagination,
  getNewsScores
} from '@/redux/slices/sentiment.slice';
import { Table, TableColumnsType, Radio, Button } from 'antd';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { convertSortType } from '@/utils/sort-table';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { cleanFalsyValues, isNumeric, roundToDecimals } from '@/utils/common';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { TableTitle } from './title.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { isMobile } from 'react-device-detect';
import { useTranslations } from 'next-intl';
import { SymbolCell } from './columns/symbol-cell.column';
import { DateTimeCell } from './columns/date-time-cell.column';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageURLs } from '@/utils/navigate';
import { PositiveNegativeText } from '../positive-negative-text';
import Link from 'next/link';

export const NewsScoresTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');
  const { height } = useWindowSize();

  const loading = useAppSelector(watchNewsScoresLoading);
  const list = useAppSelector(watchNewsScores);
  const pagination = useAppSelector(watchNewsScoresPagination);

  const [filter, setFilter] = useState<Record<string, any>>({
    typeDay: 3
  });

  const { sortField, sortType, handleSortOrder } = useSortOrder({
    defaultField: 'avgAggScore',
    defaultOrder: 'descend',
    currentFilter: filter,
    onChange: (_f, _o, newFilter) => {
      setFilter(newFilter);
      fetchData({
        page: PAGINATION.currentPage,
        pageSize: pagination.pageSize,
        filter: newFilter
      });
    }
  });

  const fetchData = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      dispatch(
        getNewsScores({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          symbol: symbol ?? undefined,
          ...cleanFalsyValues(filter)
        })
      );
    },
    [dispatch, sortField, sortType, symbol]
  );

  useEffect(() => {
    fetchData({ filter });
    return () => {
      dispatch(resetState());
    };
  }, [filter, fetchData, dispatch, symbol]);

  const handleTypeDayChange = (value: number) => {
    const newFilter = {
      ...filter,
      typeDay: value
    };
    setFilter(newFilter);
    fetchData({ filter: newFilter });
  };

  const columns: TableColumnsType<NewsScore> = useMemo(
    () => [
      {
        title: t('stt'),
        key: 'index',
        width: 50,
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
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'symbol' ? sortType : null,
        fixed: !isMobile && 'left',
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('symbol')
        }),
        render: (value) => <SymbolCell symbol={value} />
      },
      {
        title: 'Finnhub Score',
        dataIndex: 'finnhubAggScore',
        key: 'finnhubAggScore',
        width: 116,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'finnhubAggScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('finnhubAggScore')
        }),
        render: (value, record) =>
          isNumeric(value) ? (
            <Link
              href={`${PageURLs.ofFinnhubLsegNews()}?symbol=${
                record.symbol
              }&sourceType=finnhub`}
            >
              <PositiveNegativeText
                isNegative={value < 0}
                isPositive={value > 0}
              >
                <span css={scoreNewsLinkStyles}>{roundToDecimals(value)}</span>
              </PositiveNegativeText>
            </Link>
          ) : (
            '-'
          )
      },
      {
        title: 'LSEG Score',
        dataIndex: 'lsegAggScore',
        key: 'lsegAggScore',
        width: 100,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'lsegAggScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('lsegAggScore')
        }),
        render: (value, record) =>
          isNumeric(value) ? (
            <Link
              href={`${PageURLs.ofFinnhubLsegNews()}?symbol=${
                record.symbol
              }&sourceType=lseg`}
            >
              <PositiveNegativeText
                isNegative={value < 0}
                isPositive={value > 0}
              >
                <span css={scoreNewsLinkStyles}>{roundToDecimals(value)}</span>
              </PositiveNegativeText>
            </Link>
          ) : (
            '-'
          )
      },
      {
        title: 'Finnhub Total Articles',
        dataIndex: 'finnhubTotalArticles',
        key: 'finnhubTotalArticles',
        width: 86,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'finnhubTotalArticles' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('finnhubTotalArticles')
        }),
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
        title: 'LSEG Total Articles',
        dataIndex: 'lsegTotalArticles',
        key: 'lsegTotalArticles',
        width: 82,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'lsegTotalArticles' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('lsegTotalArticles')
        }),
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
        title: 'Average Score',
        dataIndex: 'avgAggScore',
        key: 'avgAggScore',
        width: 120,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'avgAggScore' ? sortType : null,
        hidden: true,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('avgAggScore')
        }),
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
        title: 'Finnhub Updated',
        dataIndex: 'finnhubLatestDatetime',
        key: 'finnhubLatestDatetime',
        width: 136,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'finnhubLatestDatetime' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('finnhubLatestDatetime')
        }),
        render: (value) => (value ? <DateTimeCell value={value} /> : '-')
      },
      {
        title: 'LSEG Updated',
        dataIndex: 'lsegLatestDatetime',
        key: 'lsegLatestDatetime',
        width: 110,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'lsegLatestDatetime' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('lsegLatestDatetime')
        }),
        render: (value) => (value ? <DateTimeCell value={value} /> : '-')
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        align: 'center',
        fixed: !isMobile && 'right',
        render: (_, record) => (
          <Button
            onClick={() =>
              router.push(
                `${PageURLs.ofFinnhubLsegNews()}?symbol=${record.symbol}`
              )
            }
          >
            Compare News
          </Button>
        )
      }
    ],
    [
      t,
      pagination.currentPage,
      pagination.pageSize,
      sortField,
      sortType,
      handleSortOrder,
      router
    ]
  );

  return (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        <div css={titleRowStyles}>
          <TableTitle>News Scores</TableTitle>

          <Radio.Group
            value={filter.typeDay}
            onChange={(e) => handleTypeDayChange(e.target.value)}
            buttonStyle='solid'
          >
            <Radio.Button value={1}>1 Day</Radio.Button>
            <Radio.Button value={3}>3 Day</Radio.Button>
          </Radio.Group>
        </div>

        <Table<NewsScore>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey='symbol'
          columns={columns}
          dataSource={list}
          loading={loading}
          scroll={{
            x: 1100,
            y: list.length > 0 ? height - 244 : undefined
          }}
          locale={{
            emptyText: (
              <div css={emptyStyles(height - 360)}>
                <EmptyDataTable />
              </div>
            )
          }}
          pagination={{
            position: ['bottomCenter'],
            showSizeChanger: true,
            showQuickJumper: true,
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => fetchData({ page, pageSize, filter })
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
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.6rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const scoreNewsLinkStyles = css`
  text-decoration: underline;
`;
