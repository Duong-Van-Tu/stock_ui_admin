/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  resetState,
  watchMarketPsych,
  watchMarketPsychLoading,
  watchMarketPsychPagination,
  getMarketPsychLatest
} from '@/redux/slices/sentiment.slice';
import { Table, TableColumnsType, Button } from 'antd';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { SymbolCell } from './columns/symbol-cell.column';
import { DateTimeCell } from './columns/date-time-cell.column';
import { TableTitle } from './title.table';
import { useSearchParams } from 'next/navigation';
import { isMobile } from 'react-device-detect';
import { MarketPsychFilter } from '../filters/market-psych.filter';
import { PositiveNegativeText } from '../positive-negative-text';
import { isNumeric, roundToDecimals, cleanFalsyValues } from '@/utils/common';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { convertSortType } from '@/utils/sort-table';
import { Icon } from '../icons';
import { MARKET_PSYCH_DATA_TYPES } from '@/constants/common.constant';

export const MarketPsychTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');
  const { height } = useWindowSize();

  const loading = useAppSelector(watchMarketPsychLoading);
  const data = useAppSelector(watchMarketPsych);
  const pagination = useAppSelector(watchMarketPsychPagination);

  const [filter, setFilter] = useState<MarketPsychFilter>({
    page: 1,
    limit: 100
  });
  const [isFilterReady, setIsFilterReady] = useState(false);

  const { sortField, sortType, handleSortOrder } = useSortOrder({
    defaultField: 'windowTimestamp',
    defaultOrder: 'descend',
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      setFilter(newFilter);
    }
  });

  const fetchData = useCallback(
    ({ page = 1, pageSize = 100, currentFilter = filter } = {}) => {
      const filteredFilter = cleanFalsyValues(currentFilter);
      dispatch(
        getMarketPsychLatest({
          ticker: symbol ?? '',
          ...filteredFilter,
          page,
          limit: pageSize,
          sortField: fieldMapping[sortField] ?? sortField,
          sortType: convertSortType(sortType)
        })
      );
    },
    [dispatch, symbol, sortField, sortType, filter]
  );

  const handleFilter = useCallback((values: MarketPsychFilter) => {
    setFilter((prev) => ({ ...prev, ...values, page: 1 }));
  }, []);

  const handleFilterReady = useCallback((values: MarketPsychFilter) => {
    setFilter((prev) => ({ ...prev, ...values }));
    setIsFilterReady(true);
  }, []);

  const handlePageChange = (page: number, pageSize: number) => {
    setFilter((prev) => ({ ...prev, page, limit: pageSize }));
  };

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isFilterReady) {
      fetchData({ page: filter.page, pageSize: filter.limit });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isFilterReady,
    symbol,
    filter.page,
    filter.limit,
    filter.startDate,
    filter.endDate,
    filter.dataType,
    sortField,
    sortType
  ]);

  const renderScore = (value: number | undefined, decimals = 4) =>
    isNumeric(value) ? (
      <PositiveNegativeText isNegative={value! < 0} isPositive={value! > 0}>
        {roundToDecimals(value!, decimals)}
      </PositiveNegativeText>
    ) : (
      '-'
    );

  const columns: TableColumnsType<MarketPsych> = useMemo(
    () => [
      {
        title: t('stt'),
        dataIndex: 'index',
        key: 'index',
        width: 70,
        align: 'center',
        fixed: !isMobile ? 'left' : undefined,
        render: (_v, _r, index) =>
          index + 1 + (pagination.currentPage - 1) * pagination.pageSize
      },
      {
        title: t('symbol'),
        dataIndex: 'ticker',
        key: 'ticker',
        width: 100,
        align: 'left',
        fixed: !isMobile ? 'left' : undefined,
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'ticker' ? sortType : null,
        onHeaderCell: () => ({ onClick: () => handleSortOrder('ticker') }),
        render: (v) => <SymbolCell symbol={v} />
      },
      {
        title: t('time'),
        dataIndex: 'windowTimestamp',
        key: 'windowTimestamp',
        width: 160,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'windowTimestamp' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('windowTimestamp')
        }),
        render: (v) => <DateTimeCell value={v} />
      },
      {
        title: t('dataType'),
        dataIndex: 'dataType',
        key: 'dataType',
        width: 130,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'dataType' ? sortType : null,
        onHeaderCell: () => ({ onClick: () => handleSortOrder('dataType') }),
        render: (v) =>
          MARKET_PSYCH_DATA_TYPES.find((item) => item.value === v)?.label || v
      },
      {
        title: t('sentimentScore'),
        dataIndex: 'psychSentimentScore',
        key: 'psychSentimentScore',
        width: 154,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'psychSentimentScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('psychSentimentScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('buzz'),
        dataIndex: 'buzz',
        key: 'buzz',
        width: 84,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'buzz' ? sortType : null,
        onHeaderCell: () => ({ onClick: () => handleSortOrder('buzz') }),
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: t('mentions'),
        dataIndex: 'mentions',
        key: 'mentions',
        width: 100,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'mentions' ? sortType : null,
        onHeaderCell: () => ({ onClick: () => handleSortOrder('mentions') }),
        render: (v) => (isNumeric(v) ? roundToDecimals(v, 2) : '-')
      },
      {
        title: t('trustScore'),
        dataIndex: 'trustScore',
        key: 'trustScore',
        width: 120,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'trustScore' ? sortType : null,
        onHeaderCell: () => ({ onClick: () => handleSortOrder('trustScore') }),
        render: (v) => renderScore(v)
      },
      {
        title: t('loveHateScore'),
        dataIndex: 'loveHateScore',
        key: 'loveHateScore',
        width: 150,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'loveHateScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('loveHateScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('emotionVsFact'),
        dataIndex: 'emotionVsFactScore',
        key: 'emotionVsFactScore',
        width: 160,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'emotionVsFactScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('emotionVsFactScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('uncertainty'),
        dataIndex: 'uncertaintyScore',
        key: 'uncertaintyScore',
        width: 140,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'uncertaintyScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('uncertaintyScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('stress'),
        dataIndex: 'stressScore',
        key: 'stressScore',
        width: 110,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'stressScore' ? sortType : null,
        onHeaderCell: () => ({ onClick: () => handleSortOrder('stressScore') }),
        render: (v) => renderScore(v)
      },
      {
        title: t('optimism'),
        dataIndex: 'optimismScore',
        key: 'optimismScore',
        width: 110,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'optimismScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('optimismScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('pessimism'),
        dataIndex: 'pessimismScore',
        key: 'pessimismScore',
        width: 120,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'pessimismScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('pessimismScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('marketRisk'),
        dataIndex: 'marketRiskScore',
        key: 'marketRiskScore',
        width: 130,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'marketRiskScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('marketRiskScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('innovation'),
        dataIndex: 'innovationScore',
        key: 'innovationScore',
        width: 120,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'innovationScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('innovationScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('longShort'),
        dataIndex: 'longShortScore',
        key: 'longShortScore',
        width: 130,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'longShortScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('longShortScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('shortVsLongTerm'),
        dataIndex: 'shortVsLongTermScore',
        key: 'shortVsLongTermScore',
        width: 180,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'shortVsLongTermScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('shortVsLongTermScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('futureVsPast'),
        dataIndex: 'futureVsPastScore',
        key: 'futureVsPastScore',
        width: 140,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'futureVsPastScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('futureVsPastScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('earningsDirection'),
        dataIndex: 'earningsDirectionScore',
        key: 'earningsDirectionScore',
        width: 170,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'earningsDirectionScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('earningsDirectionScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('revenueDirection'),
        dataIndex: 'revenueDirectionScore',
        key: 'revenueDirectionScore',
        width: 170,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'revenueDirectionScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('revenueDirectionScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('accountingSentiment'),
        dataIndex: 'accountingSentimentScore',
        key: 'accountingSentimentScore',
        width: 190,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'accountingSentimentScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('accountingSentimentScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('dividendsScore'),
        dataIndex: 'dividendsScore',
        key: 'dividendsScore',
        width: 150,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'dividendsScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('dividendsScore')
        }),
        render: (v) => renderScore(v)
      },
      {
        title: t('analystRating'),
        dataIndex: 'analystRatingScore',
        key: 'analystRatingScore',
        width: 150,
        align: 'center',
        sorter: true,
        showSorterTooltip: false,
        sortOrder: sortField === 'analystRatingScore' ? sortType : null,
        onHeaderCell: () => ({
          onClick: () => handleSortOrder('analystRatingScore')
        }),
        render: (v) => renderScore(v)
      }
    ],
    [t, pagination, sortField, sortType, handleSortOrder]
  );

  return (
    <div css={rootStyles}>
      <div css={filterBarStyles}>
        <MarketPsychFilter
          onFilter={handleFilter}
          onFilterReady={handleFilterReady}
        />
      </div>
      <div css={tableWrapperStyles}>
        <TableTitle customStyles={titleStyles}>
          <span>{t('marketPsychology')}</span>
          <Button
            onClick={() =>
              fetchData({
                page: pagination.currentPage,
                pageSize: pagination.pageSize
              })
            }
            type='text'
            css={refreshIconBtnStyles}
            icon={
              <Icon
                icon='refresh'
                width={22}
                height={22}
                fill='var(--text-color)'
              />
            }
            shape='circle'
          />
        </TableTitle>
        <Table<MarketPsych>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey='key'
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{
            x: 1200,
            y: data.length > 0 ? height - 320 : undefined
          }}
          locale={{
            emptyText: (
              <div css={emptyStyles(height - 500)}>
                <EmptyDataTable />
              </div>
            )
          }}
          pagination={{
            position: ['bottomCenter'],
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            onChange: handlePageChange
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
const emptyStyles = (height: number) =>
  css`
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `;
const titleStyles = css`
  padding: 1.2rem 1.6rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const refreshIconBtnStyles = css`
  color: var(--text-color);
  background: transparent !important;
  border: none !important;
  box-shadow: none;

  &:hover,
  &:focus-visible {
    background: transparent !important;
    border: none !important;
    box-shadow: none;
  }
`;
