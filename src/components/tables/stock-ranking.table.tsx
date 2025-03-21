import React, { Key, useCallback, useEffect, useState } from 'react';
import { Table, TableColumnsType } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { cleanFalsyValues, formatNumber } from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getStockScore,
  watchStockScoreData,
  watchStockScoreLoading,
  watchStockScorePagination
} from '@/redux/slices/stock-score.slice';
import { PositiveNegativeText } from '../positive-negative-text';

export const StockRankingTable = () => {
  const dispatch = useAppDispatch();

  const stockScoreData = useAppSelector(watchStockScoreData);
  const pagination = useAppSelector(watchStockScorePagination);
  const loading = useAppSelector(watchStockScoreLoading);

  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<Key>>(new Set());

  const onSelectChange = (newSelectedRowKeys: Key[]) => {
    setSelectedRowKeys((prevKeys) => {
      const updatedKeys = new Set(prevKeys);

      newSelectedRowKeys.forEach((key) => updatedKeys.add(key));

      stockScoreData.forEach((item) => {
        if (!newSelectedRowKeys.includes(item.id)) {
          updatedKeys.delete(item.id);
        }
      });

      return new Set(updatedKeys);
    });
  };

  const rowSelection: TableRowSelection<StockScore> = {
    selectedRowKeys: Array.from(selectedRowKeys),
    onChange: onSelectChange
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
          ...filteredFilter
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    fetchDataStockScore({});
  }, [fetchDataStockScore]);

  const columns: TableColumnsType<StockScore> = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      fixed: true
    },
    {
      title: 'Total score',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 120,
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: 'Fundamental score',
      dataIndex: 'fundamentalScore',
      key: 'fundamentalScore',
      width: 170,
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: 'Sentiment score',
      dataIndex: 'sentimentScore',
      key: 'sentimentScore',
      width: 160,
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: 'Earnings score',
      dataIndex: 'earningsScore',
      key: 'earningsScore',
      width: 140,
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: 'YTD',
      dataIndex: 'ytd',
      key: 'ytd',
      width: 140,
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: 'Day change',
      dataIndex: 'dayChangePercent',
      key: 'dayChangePercent',
      width: 140,
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: 'Current price',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: 'Volume',
      dataIndex: 'volume',
      key: 'volume',
      width: 120,
      align: 'center',
      render: (value) => formatNumber(value, 2)
    },
    {
      title: 'Beta',
      dataIndex: 'beta',
      key: 'beta',
      width: 140,
      align: 'center',
      render: (value) => formatNumber(value, 2)
    },
    {
      title: 'ATR',
      dataIndex: 'atr',
      key: 'atr',
      width: 100,
      align: 'center',
      render: (value) => formatNumber(value, 2)
    }
  ];

  return (
    <Table<StockScore>
      bordered
      rowKey={(record) => record.id}
      rowSelection={rowSelection}
      columns={columns}
      dataSource={stockScoreData}
      loading={loading}
      scroll={{ x: 'max-content', y: 55 * 11 }}
      pagination={{
        position: ['bottomCenter'],
        showQuickJumper: true,
        current: pagination.currentPage,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: (page, pageSize) => {
          fetchDataStockScore({ page, pageSize });
        }
      }}
    />
  );
};
