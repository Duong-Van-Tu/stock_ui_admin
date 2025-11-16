/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useState } from 'react';
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
import { TimeZone } from '@/constants/timezone.constant';
import dayjs from 'dayjs';

type OptionChangesTableProps = {
  optionType: 'Call' | 'Put';
};

export const OptionChangesTable = ({ optionType }: OptionChangesTableProps) => {
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
          [fieldMapping['optionType']]: optionType,
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
    }, 60000);
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
      title: 'Type',
      dataIndex: 'optionType',
      key: 'optionType',
      width: 80,
      align: 'center'
    },
    {
      title: 'Strike',
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
      title: 'Exp Date',
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
      title: 'DTE',
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
      title: 'Ask',
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
      title: 'Moneyness (%)',
      dataIndex: 'moneyness',
      key: 'moneyness',
      width: 146,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'moneyness' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('moneyness')
      }),
      render: (v) => (isNumeric(v) ? `${roundToDecimals(v, 2)}%` : '-')
    },
    {
      title: 'BE(Ask)',
      dataIndex: 'beAsk',
      key: 'beAsk',
      width: 100,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'beAsk' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('beAsk') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: '%BE(Ask)',
      dataIndex: 'beAskPercent',
      key: 'beAskPercent',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'beAskPercent' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('beAskPercent') }),
      render: (v) => (isNumeric(v) ? formatPercent(v * 100, 4) : '-')
    },
    {
      title: 'Bid-Ask%',
      dataIndex: 'bidAsk',
      key: 'bidAsk',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'bidAsk' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('bidAsk') }),
      render: (v) => (isNumeric(v) ? formatPercent(v * 100, 4) : '-')
    },
    {
      title: 'Volume',
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
      title: 'Open Int',
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
      title: 'Theta',
      dataIndex: 'theta',
      key: 'theta',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'theta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('theta') }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v, 6)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: 'Delta',
      dataIndex: 'delta',
      key: 'delta',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'delta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('delta') }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{roundToDecimals(v, 6)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: t('lastPrice'),
      dataIndex: 'price',
      key: 'price',
      width: 110,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'price' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('price') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: t('currentPrice'),
      dataIndex: 'newStockPrice',
      key: 'newStockPrice',
      width: 120,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'price' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('price') }),
      render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
    },
    {
      title: `${t('change')}$`,
      dataIndex: 'change',
      key: 'change',
      width: 100,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'change' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('change') }),
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
      title: `${t('change')}%`,
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
      title: 'Delta Price Change',
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
            <span>{roundToDecimals(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    },
    {
      title: 'New option price',
      dataIndex: 'newOptionPremium',
      key: 'newOptionPremium',
      width: 160,
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
      title: '% Profit Return',
      dataIndex: 'profitNoTheta',
      key: 'profitNoTheta',
      width: 150,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'profitNoTheta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('profitNoTheta') }),
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
      title: '% Profit (with time decay)',
      dataIndex: 'profitTheta',
      key: 'profitTheta',
      width: 200,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'profitTheta' ? sortType : null,
      onHeaderCell: () => ({ onClick: () => handleSortOrder('profitTheta') }),
      render: (v) =>
        isNumeric(v) ? (
          <PositiveNegativeText isPositive={v > 0} isNegative={v < 0}>
            <span>{formatPercent(v)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
        )
    }
  ];

  const mobileKeys = [
    'symbol',
    'optionType',
    'strike',
    'expDate',
    'dte',
    'ask',
    'price_current',
    'stock_change',
    'volume'
  ];

  const columns: TableColumnsType<OptionChange> = isMobile
    ? baseColumns.filter((c) => mobileKeys.includes(c.key as string))
    : baseColumns;

  return (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        <div css={tableTopStyles}>
          <div css={tableTopRightStyles}>
            <TableTitle customStyles={titleStyles}>
              <span>
                {optionType === 'Call'
                  ? t('optionChainCall')
                  : t('optionChainPut')}{' '}
              </span>
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
            <div css={updatedAtStyles}>
              {data.length > 0 && (
                <>
                  <strong>{t('updatedAt')}:</strong>&nbsp;
                  <span css={dateTextStyles}>
                    {dayjs(data[0].updatedAt)
                      .tz(TimeZone.NEW_YORK)
                      .format('MMM D, YYYY h:mm A')}
                  </span>
                </>
              )}
            </div>
          </div>
          <ImportSymbolButton url='option-changes/import' />
        </div>

        <Table<OptionChange>
          rowClassName={(r) => (r.suggested ? 'hl-add-symbol' : '')}
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={data}
          loading={loading && !suppressLoading}
          showHeader
          scroll={{
            x: isMobile ? 700 : 1200,
            y: height - 268
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

const dateTextStyles = css`
  margin-right: 0.6rem;
`;

const updatedAtStyles = css`
  font-size: ${isMobile ? '1.4rem' : '1.6rem'};
`;

const tableTopRightStyles = css`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;
