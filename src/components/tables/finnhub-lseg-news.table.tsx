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
import {
  Button,
  Table,
  TableColumnsType,
  Tooltip,
  Badge,
  Checkbox
} from 'antd';
import { useCallback, useEffect, useState, Key } from 'react';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { convertSortType } from '@/utils/sort-table';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import {
  cleanFalsyValues,
  isNumeric,
  isUrl,
  roundToDecimals
} from '@/utils/common';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { TableTitle } from './title.table';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { isMobile } from 'react-device-detect';
import { FinnhubAndLsegNewsFilter } from '../filters/finnhub-lseg-news.filter';
import { DateTimeCell } from './columns/date-time-cell.column';
import EllipsisText from '../ellipsis-text';
import { SymbolCell } from './columns/symbol-cell.column';
import { useModal } from '@/hooks/modal.hook';
import { useTranslations } from 'next-intl';
import { Icon } from '../icons';
import { PositiveNegativeText } from '../positive-negative-text';
import { Recommendation } from '@/constants/common.constant';
import { ExportExcelFinnhubLsegNews } from '../export-excel-finnhub-lseg-news';
import { StockChangeCell } from './columns/stock-change-cell.column';
import { defaultApiFetcher } from '@/utils/api-instances';
import { transformFinnhubAndLsegNews } from '@/helpers/sentiment.helper';

export const FinnhubAndLsegNewsTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const symbol = searchParams.get('symbol');
  const storyId = searchParams.get('storyId');
  const { height } = useWindowSize();
  const modal = useModal();

  const loading = useAppSelector(watchFinnhubAndLsegNewsLoading);
  const listNews = useAppSelector(watchFinnhubAndLsegNews);
  const pagination = useAppSelector(watchFinnhubAndLsegNewsPagination);

  const [filter, setFilter] = useState<SentimentFilter>({});
  const [isFilterReady, setIsFilterReady] = useState(false);
  const [isTopLseg, setIsTopLseg] = useState(false);

  const [expandedNews, setExpandedNews] = useState<
    Record<string, FinnhubAndLsegNewsTableItem[]>
  >({});
  const [expandedLoading, setExpandedLoading] = useState<string[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>([]);

  const { sortField, sortType, handleSortOrder } =
    useSortOrder<SentimentFilter>({
      defaultField: 'datetime',
      defaultOrder: 'descend',
      currentFilter: filter,
      onChange: (_field, _order, newFilter) => {
        setFilter(newFilter);
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
          storyId: storyId ?? undefined,
          isTopLseg,
          ...filteredFilter
        })
      );
    },
    [symbol, storyId, dispatch, sortField, sortType, isTopLseg]
  );

  const handleExpandRow = useCallback(
    async (expanded: boolean, record: any) => {
      if (expanded) {
        const compositeKey = `${record.symbol}_${record.id}`;
        setExpandedLoading((prev) => [...prev, compositeKey]);

        try {
          const detail = await defaultApiFetcher.get('news/list', {
            query: {
              page: 1,
              limit: PAGINATION_PARAMS.unLimit,
              symbol: record.symbol,
              isNews24h: true,
              source_type: filter.sourceType ?? undefined
            }
          });

          setExpandedNews((prev) => ({
            ...prev,
            [compositeKey]: transformFinnhubAndLsegNews(detail.data.result)
          }));
        } catch (error) {
          console.error('Failed to fetch expanded news:', error);
        } finally {
          setExpandedLoading((prev) =>
            prev.filter((key) => key !== compositeKey)
          );
        }
      }
    },
    [filter.sourceType]
  );

  const handleExpandRowKeys = useCallback(
    (record: FinnhubAndLsegNewsTableItem) => {
      const rowKey = record.key;
      setExpandedRowKeys((prev) =>
        prev.includes(rowKey)
          ? prev.filter((k) => k !== rowKey)
          : [...prev, rowKey]
      );
      if (!expandedRowKeys.includes(rowKey)) {
        handleExpandRow(true, record);
      }
    },
    [expandedRowKeys, handleExpandRow]
  );

  const handleRefresh = useCallback(() => {
    if (storyId) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('storyId');
      router.push(`${pathname}?${newSearchParams.toString()}`);
    } else {
      fetchListNews({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        filter
      });
    }
  }, [
    storyId,
    searchParams,
    router,
    pathname,
    fetchListNews,
    pagination.currentPage,
    pagination.pageSize,
    filter
  ]);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      symbol: symbol ?? undefined,
      storyId: storyId ?? undefined
    }));
  }, [symbol, storyId]);

  useEffect(() => {
    if (isFilterReady) {
      fetchListNews({
        page: 1,
        pageSize: pagination.pageSize,
        filter
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFilterReady, filter, sortField, sortType, isTopLseg]);

  const handleFilter = (values: SentimentFilter) => {
    const newFilter = { ...filter, ...values };
    setFilter(newFilter);
  };

  const handleFilterReady = (values: SentimentFilter) => {
    setFilter(values);
    setIsFilterReady(true);
  };

  const dataSource = Array.isArray(listNews) ? listNews : [];

  const columns: TableColumnsType<FinnhubAndLsegNewsTableItem> = [
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
      title: t('count'),
      dataIndex: 'totalNews24H',
      key: 'totalNews24H',
      width: 76,
      align: 'center',
      fixed: !isMobile && 'left',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'totalNews24H' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('totalNews24H')
      }),
      render: (value, record) => {
        const isExpanded = expandedRowKeys.includes(record.key);
        if (value > 0) {
          return (
            <Badge count={value} color='gold'>
              <Button
                css={expandIconBtnStyles}
                onClick={() => handleExpandRowKeys(record)}
                icon={
                  isExpanded ? (
                    <Icon icon='arrowDown' width={16} height={16} />
                  ) : (
                    <Icon icon='right' width={18} height={18} />
                  )
                }
              />
            </Badge>
          );
        }
        return '-';
      }
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
      onCell: (record) => ({
        className:
          (record.breakingNews === 1
            ? 'hl-breaking-news-positive '
            : record.breakingNews === -1
              ? 'hl-breaking-news-negative '
              : '') +
          (record.articleScore && record.articleScore > 5
            ? 'hl-high-score-symbol'
            : '')
      }),
      render: (value) => <SymbolCell symbol={value} />
    },
    {
      title: 'Publishing Time',
      dataIndex: 'datetime',
      key: 'datetime',
      width: 150,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'datetime' ? sortType : null,
      fixed: !isMobile && 'left',
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('datetime')
      }),
      align: 'center',
      onCell: (record) => ({
        className:
          record.breakingNews === 1
            ? 'hl-breaking-news-positive'
            : record.breakingNews === -1
              ? 'hl-breaking-news-negative'
              : ''
      }),
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
      render: (value, record) => (
        <div css={titleCellStyles}>
          {!!record.breakingNews && (
            <Tooltip
              css={fireIconStyles}
              title={isMobile ? null : t('breakingNews')}
            >
              <Button
                type='text'
                icon={
                  <Icon
                    fill={
                      record.breakingNews === 1
                        ? 'var(--positive-color)'
                        : record.breakingNews === -1
                          ? 'var(--negative-color)'
                          : ''
                    }
                    icon='fire'
                    width={18}
                    height={18}
                  />
                }
                shape='circle'
              />
            </Tooltip>
          )}
          <EllipsisText text={value} maxLines={2} />
        </div>
      )
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
      title: 'News Type',
      dataIndex: 'newsType',
      key: 'newsType',
      width: 180,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newsType' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('newsType')
      }),
      align: 'center',
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={2} /> : '-'
    },
    {
      title: 'Article Score',
      dataIndex: 'articleScore',
      key: 'articleScore',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'articleScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('articleScore')
      }),
      align: 'center',
      render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
    },
    {
      title: 'Impact Score',
      dataIndex: 'impactScore',
      key: 'impactScore',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'impactScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('impactScore')
      }),
      align: 'center',
      render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
    },
    {
      title: 'Sentiment Score',
      dataIndex: 'newsScore',
      key: 'newsScore',
      width: 150,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newsScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('newsScore')
      }),
      align: 'center',

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
      title: 'Top News',
      dataIndex: 'topNewsMetadata',
      key: 'topNewsMetadata',
      width: 114,
      sorter: true,
      showSorterTooltip: false,
      hidden: true,
      sortOrder: sortField === 'topNewsMetadata' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('topNewsMetadata')
      }),
      align: 'center'
    },
    {
      title: 'Sector',
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
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={2} /> : '-'
    },
    {
      title: 'Industry',
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
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={2} /> : '-'
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
      hidden: filter.sourceType === 'lseg',
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
      hidden: filter.sourceType === 'lseg',
      render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
    },
    {
      title: 'Grok Rating',
      dataIndex: 'grokRating',
      key: 'grokRating',
      width: 120,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'grokRating' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('grokRating')
      }),
      align: 'center',
      render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
    },
    {
      title: 'Grok Recommendation',
      dataIndex: 'grokRec',
      key: 'grokRec',
      width: 180,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'grokRec' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('grokRec')
      }),
      align: 'center',
      render: (value) =>
        value ? (
          <PositiveNegativeText
            isPositive={value === Recommendation.BUY}
            isNegative={value === Recommendation.SELL}
          >
            <span>{`${value}`.toLocaleUpperCase()}</span>
          </PositiveNegativeText>
        ) : (
          <span>-</span>
        )
    },
    {
      title: 'Grok Reasoning',
      dataIndex: 'grokReasoning',
      key: 'grokReasoning',
      width: 146,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'grokReasoning' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('grokReasoning')
      }),
      align: 'center',
      render: (value, record) =>
        value ? (
          <Button
            onClick={() =>
              modal.openModal(
                <div css={storyStyles}>
                  <h2>{`Grok Reasoning (${record.symbol})`}</h2>
                  <p>{value}</p>
                </div>,
                { width: 1000 }
              )
            }
            type='link'
            block
          >
            View Details
          </Button>
        ) : (
          '-'
        )
    },
    {
      title: 'Entry Date',
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 150,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'entryDate' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('entryDate')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: 'Entry Price',
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      width: 120,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'entryPrice' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('entryPrice')
      }),
      align: 'center',
      render: (value) => (isNumeric(value) ? roundToDecimals(value) : '-')
    },
    {
      title: 'Current Price',
      dataIndex: 'currentPricePct',
      key: 'currentPricePct',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'currentPricePct' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('currentPricePct')
      }),
      align: 'center',
      render: (value, record) =>
        isNumeric(value) ? (
          <StockChangeCell value={record.currentPrice} percentage={value} />
        ) : (
          '-'
        )
    },
    {
      title: 'Highest Price',
      dataIndex: 'highestPricePct',
      key: 'highestPricePct',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highestPricePct' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highestPricePct')
      }),
      align: 'center',
      render: (value, record) =>
        isNumeric(value) ? (
          <StockChangeCell value={record.highestPrice} percentage={value} />
        ) : (
          '-'
        )
    },
    {
      title: 'Highest Price Date',
      dataIndex: 'highestUpdateAt',
      key: 'highestUpdateAt',
      width: 168,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highestUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highestUpdateAt')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: 'Highest 3 Days Price',
      dataIndex: 'highest3DaysPricePct',
      key: 'highest3DaysPricePct',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highest3DaysPricePct' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highest3DaysPricePct')
      }),
      align: 'center',
      render: (value, record) =>
        isNumeric(value) ? (
          <StockChangeCell
            value={record.highest3DaysPrice}
            percentage={value}
          />
        ) : (
          '-'
        )
    },
    {
      title: 'Highest 3 Days Date',
      dataIndex: 'highest3DaysUpdateAt',
      key: 'highest3DaysUpdateAt',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'highest3DaysUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('highest3DaysUpdateAt')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    },
    {
      title: 'Lowest 3 Days Price',
      dataIndex: 'lowest3DaysPricePct',
      key: 'lowest3DaysPricePct',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lowest3DaysPricePct' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowest3DaysPricePct')
      }),
      align: 'center',
      render: (value, record) =>
        isNumeric(value) ? (
          <StockChangeCell
            value={record.lowest3DaysPricePct}
            percentage={value}
          />
        ) : (
          '-'
        )
    },
    {
      title: 'Lowest 3 Days Date',
      dataIndex: 'lowest3DaysUpdateAt',
      key: 'lowest3DaysUpdateAt',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lowest3DaysUpdateAt' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lowest3DaysUpdateAt')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
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
      hidden: filter.sourceType === 'lseg',
      render: (value) =>
        isUrl(value) ? (
          <a href={value} target='_blank' rel='noopener noreferrer'>
            Open
          </a>
        ) : (
          '-'
        )
    }
  ];

  const detailColumns: TableColumnsType<FinnhubAndLsegNewsTableItem> = columns
    .filter((col) => col.key !== 'symbol' && col.key !== 'totalNews24H')
    .map((col) => ({
      ...col,
      sorter: undefined,
      onHeaderCell: undefined
    }));

  return (
    <div css={rootStyles}>
      <div css={filterBarStyles}>
        <FinnhubAndLsegNewsFilter
          onFilter={handleFilter}
          onFilterReady={handleFilterReady}
        />
      </div>
      <div css={tableWrapperStyles}>
        <div css={tableTopStyles}>
          <TableTitle customStyles={titleStyles}>
            <span>Finnhub & LSEG News</span>
            <Tooltip title={!isMobile && t('refresh')}>
              <Button
                onClick={handleRefresh}
                type='text'
                icon={
                  <Icon
                    customStyles={iconStyles}
                    icon='refresh'
                    width={22}
                    height={22}
                  />
                }
                shape='circle'
              />
            </Tooltip>
          </TableTitle>
          <div css={actionStyles}>
            <Checkbox
              checked={isTopLseg}
              onChange={(e) => setIsTopLseg(e.target.checked)}
              css={checkboxStyles}
            >
              Article Score {'>'} 8
            </Checkbox>
            <ExportExcelFinnhubLsegNews filter={filter} />
          </div>
        </div>
        <Table<FinnhubAndLsegNewsTableItem>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          scroll={{
            x: 1200,
            y: dataSource.length > 0 ? height - 340 : undefined
          }}
          sortDirections={['descend', 'ascend']}
          locale={{
            emptyText: (
              <div css={emptyStyles(height - 400)}>
                <EmptyDataTable />
              </div>
            )
          }}
          expandable={{
            expandedRowRender: (row) => {
              const compositeKey = `${row.symbol}_${row.id}`;
              return (
                <Table
                  css={detailTableStyles}
                  dataSource={expandedNews[compositeKey] || []}
                  columns={detailColumns}
                  rowKey={(record) => record.key}
                  size='small'
                  pagination={false}
                  loading={expandedLoading.includes(compositeKey)}
                  scroll={{ x: 'max-content' }}
                />
              );
            },
            rowExpandable: (record) => record.totalNews24H > 0,
            onExpand: handleExpandRow,
            expandedRowKeys,
            expandIcon: () => null,
            showExpandColumn: false
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
  .ant-badge-multiple-words {
    padding: 0;
  }
`;

const tableTopStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.6rem;
  flex-wrap: wrap;
  gap: 1.4rem;
`;

const actionStyles = css`
  display: flex;
  justify-content: flex-end;
  gap: 1.2rem;
  align-items: center;
`;

const filterBarStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.6rem;
  padding: 1.6rem 1.6rem 1.2rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
  .hl-breaking-news-positive {
    background-color: var(--watching-color) !important;
  }
  .hl-breaking-news-negative {
    background-color: var(--soft-pink-color) !important;
  }
  .ant-table-expanded-row-fixed {
    padding: 0;
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
  width: ${isMobile ? '100%' : 'unset'};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  span {
    line-height: 2rem;
  }
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

const titleCellStyles = css`
  position: relative;
  padding-left: 1rem;
`;

const fireIconStyles = css`
  position: absolute;
  left: -1.4rem;
  top: -1.4rem;
`;

const iconStyles = css`
  margin-top: 0.2rem;
`;

const detailTableStyles = css`
  padding: 1.6rem 1rem;
  .ant-table {
    margin-inline: 0 !important;
  }

  .ant-table-thead {
    .ant-table-cell {
      background: var(--table-header-bg-color);
    }
  }

  .ant-table-row {
    .ant-table-cell {
      background: var(--table-row-bg-color);
    }
  }
`;

const expandIconBtnStyles = css`
  width: 2.4rem !important;
  height: 2.4rem;
`;

const checkboxStyles = css`
  display: flex;
  align-items: center;
  user-select: none;
  .ant-checkbox + span {
    padding-left: 8px;
    font-weight: 600;
    color: var(--blue-500);
  }
`;
