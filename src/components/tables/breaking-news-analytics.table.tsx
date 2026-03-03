/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Segmented,
  Select,
  Table,
  TableColumnsType,
  Tooltip
} from 'antd';
import { useTranslations } from 'next-intl';
import { isMobile } from 'react-device-detect';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getBreakingNewsAnalytics,
  getBreakingNewsTypes,
  resetState,
  watchBreakingNewsAnalytics,
  watchBreakingNewsAnalyticsLoading,
  watchBreakingNewsAnalyticsPagination,
  watchBreakingNewsTypes
} from '@/redux/slices/sentiment.slice';
import { useWindowSize } from '@/hooks/window-size.hook';
import { EmptyDataTable } from './empty.table';
import { TableTitle } from './title.table';
import { Icon } from '../icons';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { cleanFalsyValues, isNumeric, roundToDecimals } from '@/utils/common';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { convertSortType } from '@/utils/sort-table';
import { fieldMapping } from '@/helpers/field-mapping.helper';

const formatRatioPercent = (value: number | null | undefined) => {
  if (!isNumeric(value)) return '-';
  return `${roundToDecimals(Number(value) * 100)}%`;
};

const DEFAULT_SORT_FIELD = 'totalNews';
const DEFAULT_SORT_ORDER: SortOrder = 'descend';
type MarketMode = 'during' | 'off';

export const BreakingNewsAnalyticsTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();

  const loading = useAppSelector(watchBreakingNewsAnalyticsLoading);
  const list = useAppSelector(watchBreakingNewsAnalytics);
  const pagination = useAppSelector(watchBreakingNewsAnalyticsPagination);
  const breakingNewsTypes = useAppSelector(watchBreakingNewsTypes);

  const [filter, setFilter] = useState<Record<string, any>>({});
  const [marketMode, setMarketMode] = useState<MarketMode>('during');

  const { sortField, sortType, handleSortOrder } = useSortOrder<
    Record<string, any>
  >({
    defaultField: DEFAULT_SORT_FIELD,
    defaultOrder: DEFAULT_SORT_ORDER,
    currentFilter: filter,
    onChange: (_field, _order, newFilter) => {
      setFilter(newFilter);
      fetchData({
        page: PAGINATION_PARAMS.offset,
        pageSize: pagination.pageSize,
        filter: newFilter
      });
    }
  });

  const newsTypeOptions = useMemo(
    () => [
      { value: '', label: t('all') },
      ...breakingNewsTypes.map((item) => ({
        value: item.typeName,
        label: item.typeName
      }))
    ],
    [breakingNewsTypes, t]
  );

  const fetchData = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = PAGINATION_PARAMS.limit,
      filter
    }: PageChangeParams & {
      filter?: { newsType?: string; sortField?: string; sortType?: string };
    } = {}) => {
      const filtered = cleanFalsyValues(filter);
      const hasSortOverride =
        !!filter &&
        (Object.prototype.hasOwnProperty.call(filter, 'sortField') ||
          Object.prototype.hasOwnProperty.call(filter, 'sortType'));

      const requestSortField = hasSortOverride
        ? filter?.sortField
        : sortType
          ? (fieldMapping[sortField] ?? sortField)
          : undefined;

      const requestSortType = hasSortOverride
        ? filter?.sortType
        : convertSortType(sortType);

      dispatch(
        getBreakingNewsAnalytics({
          page,
          limit: pageSize,
          marketMode,
          sortField: requestSortField,
          sortType: requestSortType,
          ...filtered
        })
      );
    },
    [dispatch, marketMode, sortField, sortType]
  );

  useEffect(() => {
    dispatch(getBreakingNewsTypes());
  }, [dispatch]);

  useEffect(() => {
    fetchData({
      page: PAGINATION_PARAMS.offset,
      pageSize: PAGINATION_PARAMS.limit,
      filter
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketMode]);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  const handleFilterNewsType = (newsType?: string) => {
    const newFilter = { ...filter, newsType };
    setFilter(newFilter);
    fetchData({
      page: PAGINATION_PARAMS.offset,
      pageSize: pagination.pageSize,
      filter: newFilter
    });
  };

  const getSortableColumnProps = (field: string) => ({
    sorter: true,
    showSorterTooltip: false,
    sortOrder: sortField === field ? sortType : null,
    onHeaderCell: () => ({
      onClick: () => handleSortOrder(field)
    })
  });

  const columns: TableColumnsType<BreakingNewsAnalytics> = [
    {
      title: t('stt'),
      key: 'index',
      width: 70,
      align: 'center',
      render: (_v, _r, index) =>
        index + 1 + (pagination.currentPage - 1) * pagination.pageSize
    },
    {
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
      width: 180,
      ...getSortableColumnProps('sector')
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry',
      width: 220,
      ...getSortableColumnProps('industry')
    },
    {
      title: 'News Type',
      dataIndex: 'newsType',
      key: 'newsType',
      width: 220,
      ...getSortableColumnProps('newsType')
    },
    {
      title: 'Total News',
      dataIndex: 'totalNews',
      key: 'totalNews',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('totalNews')
    },
    {
      title: '1% Hit 30M',
      dataIndex: 'hitCount1Pct30m',
      key: 'hitCount1Pct30m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('hitCount1Pct30m')
    },
    {
      title: '1% Win 30M',
      dataIndex: 'winRate1Pct30m',
      key: 'winRate1Pct30m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('winRate1Pct30m'),
      render: (value) => formatRatioPercent(value)
    },
    {
      title: '2% Hit 30M',
      dataIndex: 'hitCount2Pct30m',
      key: 'hitCount2Pct30m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('hitCount2Pct30m')
    },
    {
      title: '2% Win 30M',
      dataIndex: 'winRate2Pct30m',
      key: 'winRate2Pct30m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('winRate2Pct30m'),
      render: (value) => formatRatioPercent(value)
    },
    {
      title: '1% Hit 60M',
      dataIndex: 'hitCount1Pct60m',
      key: 'hitCount1Pct60m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('hitCount1Pct60m')
    },
    {
      title: '1% Win 60M',
      dataIndex: 'winRate1Pct60m',
      key: 'winRate1Pct60m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('winRate1Pct60m'),
      render: (value) => formatRatioPercent(value)
    },
    {
      title: '2% Hit 60M',
      dataIndex: 'hitCount2Pct60m',
      key: 'hitCount2Pct60m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('hitCount2Pct60m')
    },
    {
      title: '2% Win 60M',
      dataIndex: 'winRate2Pct60m',
      key: 'winRate2Pct60m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('winRate2Pct60m'),
      render: (value) => formatRatioPercent(value)
    },
    {
      title: '1% Hit 90M',
      dataIndex: 'hitCount1Pct90m',
      key: 'hitCount1Pct90m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('hitCount1Pct90m')
    },
    {
      title: '1% Win 90M',
      dataIndex: 'winRate1Pct90m',
      key: 'winRate1Pct90m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('winRate1Pct90m'),
      render: (value) => formatRatioPercent(value)
    },
    {
      title: '2% Hit 90M',
      dataIndex: 'hitCount2Pct90m',
      key: 'hitCount2Pct90m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('hitCount2Pct90m')
    },
    {
      title: '2% Win 90M',
      dataIndex: 'winRate2Pct90m',
      key: 'winRate2Pct90m',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('winRate2Pct90m'),
      render: (value) => formatRatioPercent(value)
    },
    {
      title: 'Article Min',
      dataIndex: 'articleMin',
      key: 'articleMin',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('articleMin'),
      render: (value) => (isNumeric(value) ? roundToDecimals(value, 4) : '-')
    },
    {
      title: 'Article Avg',
      dataIndex: 'articleAvg',
      key: 'articleAvg',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('articleAvg'),
      render: (value) => (isNumeric(value) ? roundToDecimals(value, 4) : '-')
    },
    {
      title: 'Article Max',
      dataIndex: 'articleMax',
      key: 'articleMax',
      width: 128,
      align: 'center',
      ...getSortableColumnProps('articleMax'),
      render: (value) => (isNumeric(value) ? roundToDecimals(value, 4) : '-')
    },
    {
      title: 'Sentiment Min',
      dataIndex: 'sentimentMin',
      key: 'sentimentMin',
      width: 138,
      align: 'center',
      ...getSortableColumnProps('sentimentMin'),
      render: (value) => (isNumeric(value) ? roundToDecimals(value, 4) : '-')
    },
    {
      title: 'Sentiment Avg',
      dataIndex: 'sentimentAvg',
      key: 'sentimentAvg',
      width: 138,
      align: 'center',
      ...getSortableColumnProps('sentimentAvg'),
      render: (value) => (isNumeric(value) ? roundToDecimals(value, 4) : '-')
    },
    {
      title: 'Sentiment Max',
      dataIndex: 'sentimentMax',
      key: 'sentimentMax',
      width: 148,
      align: 'center',
      ...getSortableColumnProps('sentimentMax'),
      render: (value) => (isNumeric(value) ? roundToDecimals(value, 4) : '-')
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={noteStyles}>
        {marketMode === 'during'
          ? '* Only breaking news released during US market hours (09:30 - 15:00 ET) with a minimum article score of 0.5.'
          : '* Only breaking news released outside US market hours (before 09:30 or after 15:00 ET) with a minimum article score of 0.5.'}
      </div>
      <div css={tableWrapperStyles}>
        <div css={tableTopStyles}>
          <div css={tableTopRightStyles}>
            <TableTitle customStyles={titleStyles}>
              <span>Breaking News Analytics</span>
              <Tooltip title={!isMobile && t('refresh')}>
                <Button
                  onClick={() =>
                    fetchData({
                      page: pagination.currentPage,
                      pageSize: pagination.pageSize,
                      filter
                    })
                  }
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
            <div css={updatedAtStyles}>
              {list.length > 0 && (
                <>
                  <strong>{t('updatedAt')}:</strong>&nbsp;
                  <span css={dateTextStyles}>
                    {dayjs(list[0].updatedAt)
                      .tz(TimeZone.NEW_YORK)
                      .format('MMM D, YYYY h:mm A')}
                  </span>
                </>
              )}
            </div>
          </div>
          <div css={rightControlStyles}>
            <Segmented
              css={segmentedStyles}
              value={marketMode}
              options={[
                {
                  label: <div css={segmentedLabelStyles}>during market</div>,
                  value: 'during'
                },
                {
                  label: <div css={segmentedLabelStyles}>off market</div>,
                  value: 'off'
                }
              ]}
              onChange={(value) => setMarketMode(value as MarketMode)}
            />
            <div css={newsTypeFilterStyles}>
              <span css={filterLabelStyles}>News Type</span>
              <Select
                allowClear
                showSearch
                optionFilterProp='label'
                filterOption={(input, option) =>
                  String(option?.label || '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={newsTypeOptions}
                value={filter.newsType}
                placeholder='Select news type'
                onChange={(value) => handleFilterNewsType(value)}
                style={{ width: isMobile ? 220 : 320 }}
              />
            </div>
          </div>
        </div>

        <Table<BreakingNewsAnalytics>
          size={isMobile ? 'small' : 'middle'}
          css={tableStyles}
          rowKey={(record) => record.key}
          columns={columns}
          dataSource={list || []}
          loading={loading}
          scroll={{
            x: 2600,
            y: list.length > 0 ? height - 292 : undefined
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
            pageSizeOptions: ['20', '50', '100', '200'],
            showSizeChanger: true,
            showQuickJumper: true,
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              fetchData({ page, pageSize, filter });
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
  gap: 0.8rem;
`;

const noteStyles = css`
  color: var(--negative-color);
  font-size: 1.4rem;
  line-height: 2rem;
  font-weight: 500;
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const tableTopStyles = css`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1.2rem 1.6rem;
  @media (max-width: 1450px) {
    align-items: flex-start;
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

const iconStyles = css`
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
  min-width: 320px;
`;

const rightControlStyles = css`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-left: auto;
  @media (max-width: 1450px) {
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
  }
  @media (max-width: 992px) {
    justify-content: flex-start;
  }
`;

const segmentedStyles = css`
  padding: 0;
  .ant-segmented-item-selected {
    background: var(--primary-color);
    color: var(--white-color);
  }
  .ant-segmented-item-label {
    text-transform: uppercase;
  }
  @media (min-width: 992px) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  @media (max-width: 1450px) {
    position: static;
    left: auto;
    transform: none;
  }
`;

const segmentedLabelStyles = css`
  font-size: ${isMobile ? '1.4rem' : '1.6rem'};
  font-weight: 500;
  text-transform: uppercase;
`;

const newsTypeFilterStyles = css`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  @media (max-width: 640px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const filterLabelStyles = css`
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.8rem;
  white-space: nowrap;
`;

const tableStyles = css`
  .ant-table-thead > tr > th {
    white-space: nowrap;
  }
  .ant-table-cell {
    padding: 0.8rem 1rem !important;
  }
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
