/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Key, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Table, TableColumnsType } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  roundToDecimals,
  getRowClassName,
  formatPercent
} from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getStockScore,
  watchStockScoreData,
  watchStockScoreLoading,
  watchStockScorePagination
} from '@/redux/slices/stock-score.slice';
import { PositiveNegativeText } from '../positive-negative-text';
import { SymbolCell } from './columns/symbol-cell.column';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { watchSearchSymbol } from '@/redux/slices/search';
import { TableTitle } from './title.table';
import { LegendStatus } from '../legend-status';
import { StockRankingFilter } from '../filters/stock-ranking.filter';
import { Icon } from '../icons';
import { SocketContext } from '@/providers/socket.provider';
import { getCurrentPrice } from '@/helpers/socket.helper';
import { StockChangeCell } from './columns/stock-change-cell.column';
import { useWindowSize } from '@/hooks/useWindowSize';
import { EmptyDataTable } from './empty.table';

export const StockRankingTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const symbol = useAppSelector(watchSearchSymbol);
  const { setWatchList, resFromWS } = useContext(SocketContext);
  const { height } = useWindowSize();

  const stockScoreData = useAppSelector(watchStockScoreData);
  const pagination = useAppSelector(watchStockScorePagination);
  const loading = useAppSelector(watchStockScoreLoading);

  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<Key>>(new Set());
  const [sortField, setSortField] = useState<string>('totalScore');
  const [sortType, setSortType] = useState<SortOrder>('descend');
  const [filter, setFilter] = useState<StockScoreFilter>({});

  const onSelectChange = (newSelectedRowKeys: Key[]) => {
    setSelectedRowKeys((prevKeys) => {
      const updatedKeys = new Set(prevKeys);

      newSelectedRowKeys.forEach((key) => updatedKeys.add(key));

      stockScoreData.forEach((item) => {
        if (!newSelectedRowKeys.includes(item.key)) {
          updatedKeys.delete(item.key);
        }
      });

      return new Set(updatedKeys);
    });
  };

  const rowSelection: TableRowSelection<StockScore> = {
    selectedRowKeys: Array.from(selectedRowKeys),
    onChange: onSelectChange,
    getCheckboxProps: (record) => ({
      disabled: record.isAdd
    })
  };

  const handleSortOrder = (field: string) => {
    let newSortType: SortOrder;

    if (field === sortField) {
      newSortType =
        sortType === 'descend'
          ? 'ascend'
          : sortType === 'ascend'
          ? undefined
          : 'descend';
    } else {
      newSortType = 'descend';
    }

    setSortField(field);
    setSortType(newSortType);

    const newFilter = {
      ...filter,
      sortField: newSortType ? fieldMapping[field] ?? field : undefined,
      sortType: newSortType ? convertSortType(newSortType) : undefined
    };

    setFilter((prev) => ({ ...prev, ...newFilter }));

    fetchDataStockScore({
      page: PAGINATION.currentPage,
      pageSize: pagination.pageSize,
      filter: newFilter
    });
  };

  const handleFilter = (values: StockScoreFilter) => {
    const newFilter = {
      ...filter,
      ...values
    };
    setFilter(newFilter);
    fetchDataStockScore({ filter: newFilter });
  };

  const fetchDataStockScore = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getStockScore({
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField],
          sortType: convertSortType(sortType),
          ...filteredFilter
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    setFilter((prev) => ({ ...prev, symbol }));
    fetchDataStockScore({ filter: { symbol } });
  }, [symbol, fetchDataStockScore]);

  useEffect(() => {
    stockScoreData.forEach((row) => {
      setWatchList(row.symbol);
    });
  }, [stockScoreData, setWatchList]);

  const columns: TableColumnsType<StockScore> = [
    {
      title: t('no'),
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
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <SymbolCell
          earningDate={record.earningDate}
          symbol={record.symbol}
          companyName={record.companyName}
          isNews={record.isNews}
        />
      )
    },
    {
      title: t('totalScore'),
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 120,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'totalScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('totalScore')
      }),
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
      title: t('fundamentalScore'),
      dataIndex: 'fundamentalScore',
      key: 'fundamentalScore',
      width: 170,
      align: 'center',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'fundamentalScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('fundamentalScore')
      }),
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
      title: t('sentimentScore'),
      dataIndex: 'sentimentScore',
      key: 'sentimentScore',
      width: 160,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'sentimentScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sentimentScore')
      }),
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
      title: t('earningsScore'),
      dataIndex: 'earningsScore',
      key: 'earningsScore',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'earningsScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('earningsScore')
      }),
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
      title: t('ytd'),
      dataIndex: 'ytd',
      key: 'ytd',
      width: 120,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'ytd' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('ytd')
      }),
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
      title: t('dayChange'),
      dataIndex: 'dayChangePercent',
      key: 'dayChangePercent',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'dayChangePercent' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('dayChangePercent')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
            <span>{formatPercent(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('currentPrice'),
      dataIndex: 'price',
      key: 'price',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'price' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('price')
      }),
      align: 'center',
      render: (value, record) => {
        const currPrice = getCurrentPrice(resFromWS, record.symbol);
        const price = currPrice ?? value;
        return (
          <StockChangeCell
            value={price}
            percentage={record.dayChangePercent ? record.dayChangePercent : 0}
          />
        );
      }
    },
    {
      title: t('volume'),
      dataIndex: 'volume',
      key: 'volume',
      width: 120,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'volume' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('volume')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value, 2) : '-')
    },
    {
      title: t('beta'),
      dataIndex: 'beta',
      key: 'beta',
      width: 110,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'beta' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('beta')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value, 2) : '-')
    },
    {
      title: t('atr'),
      dataIndex: 'atr',
      key: 'atr',
      width: 100,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'atr' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('atr')
      }),
      align: 'center',
      render: (value) => (value ? roundToDecimals(value, 2) : '-')
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={tableTopStyles}>
        <TableTitle>{t('stockRankingTitle')}</TableTitle>
        <div css={actionStyles}>
          <StockRankingFilter onFilter={handleFilter} />
          <Button
            icon={
              <Icon
                icon='exportExcel'
                width={18}
                height={18}
                fill='var(--white-color)'
              />
            }
            type='primary'
          >
            {t('exportExcel')}
          </Button>
        </div>
      </div>
      <LegendStatus customStyles={legendStatusStyles} />
      <Table<StockScore>
        rowClassName={(record) =>
          getRowClassName(record, [
            { key: 'isAdd', className: 'hl-add-symbol' },
            { key: 'isAddWatchList', className: 'hl-watchList-symbol' }
          ]).join(' ')
        }
        css={tableStyles}
        rowKey={(record) => record.key}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={stockScoreData}
        loading={loading}
        scroll={{
          x: 1200,
          y: stockScoreData.length > 0 ? height - 310 : undefined
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
            fetchDataStockScore({ page, pageSize, filter });
          }
        }}
      />
    </div>
  );
};

const rootStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;

const tableTopStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.4rem;
`;

const actionStyles = css`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
`;

const legendStatusStyles = css`
  border-top: 1px solid var(--border-table-color);
  padding: 1.2rem 1.4rem;
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
