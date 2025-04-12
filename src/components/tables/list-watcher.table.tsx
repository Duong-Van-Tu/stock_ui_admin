/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getListWatcher,
  watchListWatcher,
  watchListWatcherLoading,
  watchListWatcherPagination
} from '@/redux/slices/sentiment.slice';
import { Table, TableColumnsType, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { convertSortType } from '@/utils/sort-table';
import { PAGINATION, PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  formatMarketCap,
  formatNumberShort,
  roundToDecimals
} from '@/utils/common';
import { useWindowSize } from '@/hooks/useWindowSize';
import { EmptyDataTable } from './empty.table';
import { watchSearchSymbol } from '@/redux/slices/search';
import { SymbolCell } from './columns/symbol-cell.column';
import { DateTimeCell } from './columns/date-time-cell.column';
import { PositiveNegativeText } from '../positive-negative-text';
import { StockChangeCell } from './columns/stock-change-cell.column';
import EllipsisText from '../ellipsis-text';
import { TableTitle } from './title.table';
import {
  getImpactColor,
  isNegativeSentiment,
  isPositiveSentiment
} from '@/helpers/sentiment.helper';
import { ListWatcherFilter } from '../filters/AI-sentiment.filter';
import { useSearchParams } from 'next/navigation';

export const ListWatcherTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const symbol = useAppSelector(watchSearchSymbol);
  const { height } = useWindowSize();
  const loading = useAppSelector(watchListWatcherLoading);
  const listWatcher = useAppSelector(watchListWatcher);
  const pagination = useAppSelector(watchListWatcherPagination);
  const searchParams = useSearchParams();

  const [sortField, setSortField] = useState<string>('publishingTime');
  const [sortType, setSortType] = useState<SortOrder>('descend');
  const [filter, setFilter] = useState<SentimentFilter>({});

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

    fetchListWatcher({
      page: PAGINATION.currentPage,
      pageSize: pagination.pageSize,
      filter: newFilter
    });
  };

  const handleFilter = (values: SentimentFilter) => {
    const newFilter = {
      ...filter,
      ...values
    };
    setFilter(newFilter);
    fetchListWatcher({ filter: newFilter });
  };

  const fetchListWatcher = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams = {}) => {
      const filteredFilter = cleanFalsyValues(filter);
      dispatch(
        getListWatcher({
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
    const params = new URLSearchParams(searchParams.toString());
    const initialValues = {
      lastHours: params.get('lastHours')
        ? Number(params.get('lastHours'))
        : 168, // 168 hours = 7days
      group: params.get('group') || undefined,
      sentiment: params.get('sentiment') || undefined,
      impact: params.get('impact') || undefined
    };
    setFilter((prev) => ({ ...prev, symbol, ...initialValues }));
    fetchListWatcher({ filter: { symbol, ...initialValues } });
  }, [symbol, searchParams, fetchListWatcher]);

  const columns: TableColumnsType<ListWatcher> = [
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
      title: t('group'),
      dataIndex: 'groupStock',
      key: 'groupStock',
      width: 100,
      fixed: 'left',
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'groupStock' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('groupStock')
      }),
      align: 'center',
      render: (value) =>
        value === 'group_1'
          ? `${t('group')} 1`
          : value === 'group_2'
          ? `${t('group')} 2`
          : `${t('group')} 3`
    },
    {
      title: t('publishingTime'),
      dataIndex: 'publishingTime',
      key: 'publishingTime',
      width: 162,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'publishingTime' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('publishingTime')
      }),
      align: 'center',
      render: (value) => <DateTimeCell value={value} />
    },
    {
      title: t('headline'),
      dataIndex: 'headline',
      key: 'headline',
      width: 160,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'headline' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('headline')
      }),
      render: (value) => <EllipsisText text={value} maxLines={1} />
    },
    {
      title: t('source'),
      dataIndex: 'source',
      key: 'source',
      width: 120,
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
      render: (value) => (
        <PositiveNegativeText
          isPositive={isPositiveSentiment(value)}
          isNegative={isNegativeSentiment(value)}
        >
          <span>{value}</span>
        </PositiveNegativeText>
      )
    },
    {
      title: t('impact'),
      dataIndex: 'impact',
      key: 'impact',
      width: 120,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'impact' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('impact')
      }),
      align: 'center',
      render: (value) => <Tag color={getImpactColor(value)}>{value}</Tag>
    },
    {
      title: t('beta'),
      dataIndex: 'beta',
      key: 'beta',
      width: 100,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'beta' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('beta')
      }),
      align: 'center'
    },
    {
      title: 'Avg volume',
      dataIndex: 'avgVolume',
      key: 'avgVolume',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'avgVolume' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('avgVolume')
      }),
      align: 'center',
      render: (value) => (value ? formatNumberShort(value) : '-')
    },
    {
      title: 'ATR(%)',
      dataIndex: 'atr',
      key: 'atr',
      width: 120,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'atr' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('atr')
      }),
      align: 'center',
      render: (value, record) =>
        value ? (
          <StockChangeCell value={value} percentage={record.atrPercent} />
        ) : (
          '-'
        )
    },
    {
      title: t('totalScore'),
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'totalScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('totalScore')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          '-'
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
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
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
      width: 150,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'sentimentScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sentimentScore')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
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
          <PositiveNegativeText isPositive={value > 7} isNegative={value < 4}>
            <span>{roundToDecimals(value, 2)}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: t('52WeekLow'),
      dataIndex: 'weekLow52',
      key: 'weekLow52',
      width: 140,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'weekLow52' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('weekLow52')
      }),
      align: 'center'
    },
    {
      title: t('52WeekHigh'),
      dataIndex: 'weekHigh52',
      key: 'weekHigh52',
      width: 140,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'weekHigh52' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('weekHigh52')
      }),
      align: 'center'
    },
    {
      title: t('marketCap'),
      dataIndex: 'marketCapListWatcher',
      key: 'marketCapListWatcher',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketCapListWatcher' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketCapListWatcher')
      }),
      align: 'center',
      render: (value) => (value ? formatMarketCap(value) : '-')
    },
    {
      title: t('industry'),
      dataIndex: 'industry',
      key: 'industry',
      width: 180,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'industry' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('industry')
      }),
      align: 'left',
      render: (value) => <EllipsisText text={value} maxLines={1} />
    },
    {
      title: t('subIndustry'),
      dataIndex: 'subIndustry',
      key: 'subIndustry',
      width: 180,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'subIndustry' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('subIndustry')
      }),
      align: 'left',
      render: (value) => <EllipsisText text={value} maxLines={1} />
    },
    {
      title: t('sector'),
      dataIndex: 'sector',
      key: 'sector',
      width: 200,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'sector' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('sector')
      }),
      align: 'left',
      render: (value) => <EllipsisText text={value} maxLines={1} />
    },
    {
      title: 'Link',
      dataIndex: 'url',
      key: 'url',
      width: 140,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'url' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('url')
      }),
      align: 'center',
      fixed: 'right',
      render: (value) => (
        <a href={value} target='_blank'>
          {' '}
          {t('viewDetails')}
        </a>
      )
    }
  ];

  return (
    <div css={rootStyles}>
      <ListWatcherFilter onFilter={handleFilter} />
      <div css={groupDescStyles}>
        <div css={groupItemStyles}>
          <strong>{t('group')} 1:</strong>
          <Tag color={filter.group === 'group_1' ? 'blue' : ''}>
            {t('group1')}
          </Tag>
        </div>
        <div css={groupItemStyles}>
          <strong>{t('group')} 2:</strong>
          <Tag color={filter.group === 'group_2' ? 'blue' : ''}>
            {t('group2')}
          </Tag>
        </div>
        <div css={groupItemStyles}>
          <strong>{t('group')} 3:</strong>
          <Tag color={filter.group === 'group_3' ? 'blue' : ''}>
            {t('group3')}
          </Tag>
        </div>
      </div>
      <div css={tableWrapperStyles}>
        <TableTitle customStyles={titleStyles}>{t('AISentiment')}</TableTitle>
        <Table<ListWatcher>
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={listWatcher}
          loading={loading}
          scroll={{
            x: 1200,
            y: listWatcher.length > 0 ? height - 370 : undefined
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
              fetchListWatcher({ page, pageSize, filter });
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

const groupDescStyles = css`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const groupItemStyles = css`
  display: flex;
  align-items: flex-end;
  gap: 4px;
  flex-wrap: wrap;
`;
