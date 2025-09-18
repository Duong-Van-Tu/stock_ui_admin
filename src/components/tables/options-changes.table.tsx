/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Table, TableColumnsType, Tooltip } from 'antd';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  formatPercent,
  isNumeric,
  roundToDecimals
} from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { TableTitle } from './title.table';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { isMobile } from 'react-device-detect';
import { useSearchParams } from 'next/navigation';
import { SymbolCell } from './columns/symbol-cell.column';
import {
  getOptionChanges,
  resetOptionChanges,
  watchOptionChangesData,
  watchOptionChangesLoading,
  watchOptionChangesPagination
} from '@/redux/slices/options-changes.slice';
import { Icon } from '../icons';
import { PositiveNegativeText } from '../positive-negative-text';
import { ImportSymbolButton } from '../import-symbol-template';

export const OptionChangesTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const data = useAppSelector(watchOptionChangesData);
  const pagination = useAppSelector(watchOptionChangesPagination);
  const loading = useAppSelector(watchOptionChangesLoading);

  const [filter, setFilter] = useState<Record<string, any>>({});
  const [suppressLoading, setSuppressLoading] = useState(false);

  const { sortField, sortType, handleSortOrder } = useSortOrder<
    Record<string, any>
  >({
    defaultField: 'symbol',
    defaultOrder: 'descend',
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      setFilter(newFilter);
      fetchData({
        page: PAGINATION.currentPage,
        pageSize: pagination.pageSize,
        filter: newFilter
      });
    }
  });

  const bestScoreBySymbol = (rows: { symbol: string; score?: number }[]) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      if (!r?.symbol) continue;
      const s = Number.isFinite(Number(r.score)) ? Number(r.score) : -Infinity;
      const p = m.get(r.symbol);
      if (p === undefined || s > p) m.set(r.symbol, s);
    }
    return m;
  };

  const bestMap = useMemo(() => bestScoreBySymbol(data), [data]);

  const fetchData = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter,
      silent = false
    }: PageChangeParams & { silent?: boolean } = {}) => {
      const filtered = cleanFalsyValues(filter);
      if (silent) setSuppressLoading(true);
      dispatch(
        getOptionChanges({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType),
          symbol: symbol ?? undefined,
          ...filtered
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [symbol]
  );

  useEffect(() => {
    fetchData({});
    return () => {
      dispatch(resetOptionChanges());
    };
  }, [fetchData, dispatch]);

  useEffect(() => {
    const id = setInterval(() => {
      fetchData({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        filter,
        silent: true
      });
    }, 5000);
    return () => clearInterval(id);
  }, [fetchData, pagination.currentPage, pagination.pageSize, filter]);

  useEffect(() => {
    if (!loading) setSuppressLoading(false);
  }, [loading]);

  const baseColumns: TableColumnsType<OptionChange> = [
    {
      title: t('stt'),
      dataIndex: 'index',
      key: 'index',
      width: 64,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 90,
      fixed: 'left',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'symbol' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('symbol') }),
      render: (_, record) => <SymbolCell symbol={record.symbol} />
    },
    {
      title: t('price'),
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'price' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('price') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('lastOptionPrice'),
      dataIndex: 'lastOptionPrice',
      key: 'lastOptionPrice',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lastOptionPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lastOptionPrice')
      }),
      render: (v) => (isNumeric(v) ? roundToDecimals(Number(v), 2) : v ?? '-')
    },
    {
      title: t('expDate'),
      dataIndex: 'expDate',
      key: 'expDate',
      width: 132,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'expDate' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('expDate') })
    },
    {
      title: t('dte'),
      dataIndex: 'dte',
      key: 'dte',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'dte' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('dte') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v) : '-')
    },
    {
      title: t('strike'),
      dataIndex: 'strike',
      key: 'strike',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'strike' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('strike') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('optionType'),
      dataIndex: 'optionType',
      key: 'optionType',
      width: 80,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'optionType' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('optionType') })
    },
    {
      title: t('messageType'),
      dataIndex: 'messageType',
      key: 'messageType',
      width: 136,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'messageType' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('messageType') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v) : '-')
    },
    {
      title: t('ask'),
      dataIndex: 'ask',
      key: 'ask',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'ask' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('ask') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('nttAsk'),
      dataIndex: 'nttAsk',
      key: 'nttAsk',
      width: 100,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'nttAsk' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('nttAsk') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('bfAsk'),
      dataIndex: 'bfAsk',
      key: 'bfAsk',
      width: 100,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'bfAsk' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('bfAsk') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('mfpAsk'),
      dataIndex: 'mfpAsk',
      key: 'mfpAsk',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'mfpAsk' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('mfpAsk') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('bidAsk'),
      dataIndex: 'bidAsk',
      key: 'bidAsk',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'bidAsk' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('bidAsk') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('changePercent'),
      dataIndex: 'changePercent',
      key: 'changePercent',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'changePercent' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('changePercent') }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{formatPercent(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('volume'),
      dataIndex: 'volume',
      key: 'volume',
      width: 100,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'volume' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('volume') }),
      render: (v) => roundToDecimals(v)
    },
    {
      title: t('openInt'),
      dataIndex: 'openInt',
      key: 'openInt',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'openInt' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('openInt') }),
      render: (v) => roundToDecimals(v)
    },
    {
      title: t('delta'),
      dataIndex: 'delta',
      key: 'delta',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'delta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('delta') }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('theta'),
      dataIndex: 'theta',
      key: 'theta',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'theta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('theta') }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('vega'),
      dataIndex: 'vega',
      key: 'vega',
      width: 90,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'vega' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('vega') }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('ivRank'),
      dataIndex: 'ivRank',
      key: 'ivRank',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'ivRank' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('ivRank') }),
      render: (v) => (isNumeric(v) ? formatPercent(v) : '-')
    },
    {
      title: t('itmProb'),
      dataIndex: 'itmProb',
      key: 'itmProb',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'itmProb' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('itmProb') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('otmProb'),
      dataIndex: 'otmProb',
      key: 'otmProb',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'otmProb' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('otmProb') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('costPerContract'),
      dataIndex: 'costPerContract',
      key: 'costPerContract',
      width: 140,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'costPerContract' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('costPerContract')
      }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('optionPriceChange'),
      dataIndex: 'optionPriceChange',
      key: 'optionPriceChange',
      width: 170,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'optionPriceChange' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('optionPriceChange')
      }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span> {roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('newStockPrice'),
      dataIndex: 'newStockPrice',
      key: 'newStockPrice',
      width: 120,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newStockPrice' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('newStockPrice') }),
      render: (v, record) =>
        isNumeric(v) ? (
          <PositiveNegativeText
            isPositive={v > record.price}
            isNegative={v < record.price}
          >
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('newOptionPremium'),
      dataIndex: 'newOptionPremium',
      key: 'newOptionPremium',
      width: 140,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newOptionPremium' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('newOptionPremium')
      }),
      render: (v, record) =>
        isNumeric(v) ? (
          <PositiveNegativeText
            isPositive={v > record.lastOptionPrice}
            isNegative={v < record.lastOptionPrice}
          >
            {roundToDecimals(v, 2)}
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('newOptionContract'),
      dataIndex: 'newOptionContract',
      key: 'newOptionContract',
      width: 140,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newOptionContract' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('newOptionContract')
      }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('newOptionPremiumTheta'),
      dataIndex: 'newOptionPremiumTheta',
      key: 'newOptionPremiumTheta',
      width: 138,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newOptionPremiumTheta' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('newOptionPremiumTheta')
      }),
      render: (v, record) =>
        isNumeric(v) ? (
          <PositiveNegativeText
            isPositive={v > record.newOptionPremium}
            isNegative={v < record.newOptionPremium}
          >
            {roundToDecimals(v, 2)}
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('profitNoTheta'),
      dataIndex: 'profitNoTheta',
      key: 'profitNoTheta',
      width: 146,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'profitNoTheta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('profitNoTheta') }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('profitTheta'),
      dataIndex: 'profitTheta',
      key: 'profitTheta',
      width: 124,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'profitTheta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('profitTheta') }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    }
  ];

  const mobileKeys = [
    'symbol',
    'price',
    'lastOptionPrice',
    'expDate',
    'dte',
    'strike',
    'optionType',
    'ask',
    'nttAsk',
    'bfAsk',
    'changePercent',
    'changeValue',
    'volume'
  ];

  const columns: TableColumnsType<OptionChange> = isMobile
    ? baseColumns.filter((c) => mobileKeys.includes(c.key as string))
    : baseColumns;

  return (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        <div css={tableTopStyles}>
          <TableTitle customStyles={titleStyles}>
            <span>{t('optionChangesTitle')}</span>
            <Tooltip title={!isMobile && t('refresh')}>
              <Button
                onClick={() =>
                  fetchData({
                    page: pagination.currentPage,
                    pageSize: pagination.pageSize,
                    filter,
                    silent: false
                  })
                }
                type='text'
                icon={
                  <Icon
                    customStyles={refreshIconStyles}
                    icon='refresh'
                    width={22}
                    height={22}
                  />
                }
                shape='circle'
              />
            </Tooltip>
          </TableTitle>
          <ImportSymbolButton url='option-changes/import' />
        </div>
        <Table<OptionChange>
          rowClassName={(r) =>
            bestMap.get(r.symbol) === r.score ? 'hl-add-symbol' : ''
          }
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={data}
          loading={loading && !suppressLoading}
          showHeader
          scroll={{
            x: isMobile ? 700 : 1700,
            y: height - 242
          }}
          sortDirections={['descend', 'ascend']}
          locale={{
            emptyText: (
              <div css={emptyStyles(height - 300)}>
                <EmptyDataTable />
              </div>
            )
          }}
          pagination={{
            position: ['bottomCenter'],
            pageSizeOptions: ['100', '200', '500'],
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
  gap: 1.4rem;
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
  display: flex;
  flex-direction: column;
`;

const tableTopStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.6rem;
`;

const tableStyles = css`
  .ant-table-thead > tr > th {
    white-space: nowrap;
  }
  .ant-table-cell {
    padding: ${isMobile
      ? '0.6rem 0.8rem !important'
      : '0.8rem 1rem !important'};
  }
`;

const titleStyles = css`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  span {
    line-height: 2rem;
  }
`;

const emptyStyles = (h: number) => css`
  height: ${h}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const refreshIconStyles = css`
  margin-top: 0.2rem;
`;
