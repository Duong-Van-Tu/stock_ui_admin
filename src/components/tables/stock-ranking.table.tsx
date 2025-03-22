/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Key, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Select, Table, TableColumnsType } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { cleanFalsyValues, formatNumber } from '@/utils/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getIndustries,
  getStockScore,
  watchIndustries,
  watchIndustriesLoading,
  watchStockScoreData,
  watchStockScoreLoading,
  watchStockScorePagination
} from '@/redux/slices/stock-score.slice';
import { PositiveNegativeText } from '../positive-negative-text';
import { SymbolCell } from './columns/symbol-cell';
import { useTranslations } from 'next-intl';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { watchSearchSymbol } from '@/redux/slices/search';
import { TableTitle } from './title.table';

export const StockRankingTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const symbol = useAppSelector(watchSearchSymbol);

  const stockScoreData = useAppSelector(watchStockScoreData);
  const pagination = useAppSelector(watchStockScorePagination);
  const loading = useAppSelector(watchStockScoreLoading);
  const industriesLoading = useAppSelector(watchIndustriesLoading);
  const industries = useAppSelector(watchIndustries);

  const [selectedRowKeys, setSelectedRowKeys] = useState<Set<Key>>(new Set());
  const [sortField, setSortField] = useState<string>('totalScore');
  const [sortType, setSortType] = useState<'ascend' | 'descend'>('descend');
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
    onChange: onSelectChange
  };

  const industryOptions = useMemo(
    () =>
      industries?.map((industry) => ({
        value: industry.industry,
        label: industry.industry
      })),
    [industries]
  );

  const handleSortOrder = (field: string) => {
    const newSortType =
      field === sortField
        ? sortType === 'ascend'
          ? 'descend'
          : 'ascend'
        : 'descend';

    setSortField(field);
    setSortType(newSortType);

    const newFilter = {
      ...filter,
      sortField: fieldMapping[field],
      sortType: convertSortType(newSortType)
    };

    setFilter((prev) => ({ ...prev, ...newFilter }));

    fetchDataStockScore({
      page: PAGINATION.currentPage,
      pageSize: pagination.pageSize,
      filter: newFilter
    });
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
    [dispatch, getStockScore]
  );

  const fetchIndustries = useCallback(() => {
    dispatch(getIndustries());
  }, [dispatch, getIndustries]);

  useEffect(() => {
    fetchDataStockScore({});
  }, [fetchDataStockScore]);

  useEffect(() => {
    fetchIndustries();
  }, [fetchIndustries]);

  useEffect(() => {
    setFilter((prev) => ({ ...prev, symbol }));
    fetchDataStockScore({ filter: { symbol } });
  }, [symbol]);

  const columns: TableColumnsType<StockScore> = [
    {
      title: t('no'),
      dataIndex: 'index',
      key: 'index',
      width: 50,
      align: 'center',
      fixed: true,
      render: (_, __, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: t('symbol'),
      dataIndex: 'symbol',
      key: 'symbol',
      width: 200,
      fixed: true,
      render: (_, record) => (
        <SymbolCell
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
      sortOrder: sortField === 'totalScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('totalScore')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('fundamentalScore'),
      dataIndex: 'fundamentalScore',
      key: 'fundamentalScore',
      width: 170,
      align: 'center',
      sorter: true,
      sortOrder: sortField === 'fundamentalScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('fundamentalScore')
      }),
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('sentimentScore'),
      dataIndex: 'sentimentScore',
      key: 'sentimentScore',
      width: 160,
      sorter: true,
      sortOrder: sortField === 'sentimentScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sentimentScore')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('earningsScore'),
      dataIndex: 'earningsScore',
      key: 'earningsScore',
      width: 140,
      sorter: true,
      sortOrder: sortField === 'earningsScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('earningsScore')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('ytd'),
      dataIndex: 'ytd',
      key: 'ytd',
      width: 140,
      sorter: true,
      sortOrder: sortField === 'ytd' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('ytd')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('dayChange'),
      dataIndex: 'dayChangePercent',
      key: 'dayChangePercent',
      width: 140,
      sorter: true,
      sortOrder: sortField === 'dayChangePercent' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('dayChangePercent')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('currentPrice'),
      dataIndex: 'price',
      key: 'price',
      width: 140,
      sorter: true,
      sortOrder: sortField === 'price' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('price')
      }),
      align: 'center',
      render: (value) => (
        <PositiveNegativeText isPositive={value > 0} isNegative={value < 0}>
          {value ? formatNumber(value, 2) : '-'}
        </PositiveNegativeText>
      )
    },
    {
      title: t('volume'),
      dataIndex: 'volume',
      key: 'volume',
      width: 120,
      sorter: true,
      sortOrder: sortField === 'volume' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('volume')
      }),
      align: 'center',
      render: (value) => (value ? formatNumber(value, 2) : '-')
    },
    {
      title: t('beta'),
      dataIndex: 'beta',
      key: 'beta',
      width: 110,
      sorter: true,
      sortOrder: sortField === 'beta' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('beta')
      }),
      align: 'center',
      render: (value) => (value ? formatNumber(value, 2) : '-')
    },
    {
      title: t('atr'),
      dataIndex: 'atr',
      key: 'atr',
      width: 100,
      sorter: true,
      sortOrder: sortField === 'atr' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('atr')
      }),
      align: 'center',
      render: (value) => (value ? formatNumber(value, 2) : '-')
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={tableTopStyles}>
        <TableTitle customStyles={titleStyles}>
          {t('stockRankingTitle')}
        </TableTitle>
        <div css={actionStyles}>
          <Select
            showSearch
            css={selectStyles}
            placeholder='Search select Sector'
            optionFilterProp='label'
            options={[]}
          />
          <Select
            showSearch
            css={selectStyles}
            loading={industriesLoading}
            placeholder='Search select Industry'
            optionFilterProp='label'
            options={industryOptions}
          />
          <Button type='primary'>Export Excel</Button>
        </div>
      </div>
      <Table<StockScore>
        css={tableStyles}
        rowKey={(record) => record.key}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={stockScoreData}
        loading={loading}
        scroll={{ x: 1200, y: 55 * 11 }}
        pagination={{
          position: ['bottomCenter'],
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

const tableTopStyles = css``;

const titleStyles = css`
  padding: 1rem 1.4rem;
`;

const actionStyles = css`
  padding: 1.2rem 1.4rem;
  border-top: 1px solid var(--border-table-color);
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
`;

const selectStyles = css`
  min-width: 20rem;
`;
