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
import { Button, Segmented, Table, TableColumnsType } from 'antd';
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
import {
  createSegmentedLabelStyles,
  segmentedStyles as baseSegmentedStyles
} from './segmented.styles';

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
        width: 70,
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
        width: 90,
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
        width: 80,
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
        width: 120,
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
        width: 120,
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

          <Segmented
            css={segmentedStyles}
            value={filter.typeDay}
            options={[
              {
                label: <div css={segmentedLabelStyles}>1 Day</div>,
                value: 1
              },
              {
                label: <div css={segmentedLabelStyles}>3 Day</div>,
                value: 3
              }
            ]}
            onChange={(value) => handleTypeDayChange(value as number)}
          />
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
            y: list.length > 0 ? height - 242 : undefined
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
  justify-content: flex-start;
  align-items: center;
  position: relative;
  padding: 1.2rem 1.6rem;
  gap: 1.2rem;
  flex-wrap: wrap;
`;

const segmentedStyles = css`
  ${baseSegmentedStyles};

  && {
    padding: 0.3rem;
  }

  @media (min-width: 992px) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  @media (max-width: 991px) {
    position: static;
    left: auto;
    transform: none;
  }
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

const segmentedLabelStyles = css`
  ${createSegmentedLabelStyles({
    minWidth: isMobile ? '6.4rem' : '7.6rem'
  })};
  padding: ${isMobile ? '0.6rem 0.8rem' : '0.7rem 1.1rem'};
`;
