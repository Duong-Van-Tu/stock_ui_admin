/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useCallback, useEffect } from 'react';
import { Button, Popover, Table, TableColumnsType, Tooltip } from 'antd';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  getLsegSelection,
  resetState,
  watchLsegSelectionList,
  watchLsegSelectionLoading,
  watchLsegSelectionPagination
} from '@/redux/slices/lseg-selection.slice';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { useWindowSize } from '@/hooks/window-size.hook';
import { TableTitle } from './title.table';
import { SymbolCell } from './columns/symbol-cell.column';
import {
  convertLsegSortOrder,
  formatStarValue,
  getAvailableStarCount
} from '@/helpers/lseg-selection.helper';
import {
  formatMarketCap,
  formatNumberShort,
  isNumeric,
  roundToDecimals
} from '@/utils/common';
import { PositiveNegativeText } from '../positive-negative-text';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { EmptyDataTable } from './empty.table';
import { useSortOrder } from '@/hooks/sort-order.hook';
import { isMobile } from 'react-device-detect';
import { Icon } from '../icons';
import { DateTimeCell } from './columns/date-time-cell.column';
import { useThemeMode } from '@/providers/theme.provider';
import { useSearchParams } from 'next/navigation';
import EllipsisText from '../ellipsis-text';

const renderSentimentCell = (value: number | null | undefined) => {
  if (!isNumeric(value)) return '-';

  const numericValue = value as number;

  return (
    <PositiveNegativeText
      isPositive={numericValue > 0}
      isNegative={numericValue < 0}
    >
      <span>{roundToDecimals(numericValue, 2)}</span>
    </PositiveNegativeText>
  );
};

const renderTextCell = (value: string | null | undefined) => {
  if (!value?.trim()) return '-';

  return value;
};

const parseSummaryLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':');

      if (separatorIndex === -1) {
        return {
          label: line,
          value: '-'
        };
      }

      return {
        label: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim() || '-'
      };
    });

export const LsegSelectionTable = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();
  const { height } = useWindowSize();
  const { isDarkMode } = useThemeMode();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  const loading = useAppSelector(watchLsegSelectionLoading);
  const data = useAppSelector(watchLsegSelectionList);
  const pagination = useAppSelector(watchLsegSelectionPagination);
  const popoverBackgroundColor = isDarkMode
    ? '#1f1f1f'
    : 'var(--surface-elevated-color)';
  const popoverBorderColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.1)'
    : 'var(--border-light-color)';

  const { sortField, sortType, handleSortOrder } =
    useSortOrder<LsegSelectionFilter>({
      defaultField: 'marketCapSelection',
      defaultOrder: 'descend',
      onChange: (nextField, nextOrder) => {
        fetchLsegSelection({
          page: PAGINATION_PARAMS.offset,
          pageSize: pagination.pageSize,
          sortField: nextField,
          sortType: nextOrder
        });
      }
    });

  const fetchLsegSelection = useCallback(
    ({
      page = PAGINATION_PARAMS.offset,
      pageSize = 100,
      sortField: nextSortField,
      sortType: nextSortType
    }: PageChangeParams & {
      sortField?: string;
      sortType?: SortOrder;
    } = {}) => {
      const currentSortField = nextSortField ?? sortField;
      const currentSortType = nextSortType ?? sortType;

      dispatch(
        getLsegSelection({
          page,
          limit: pageSize,
          symbol: symbol ? symbol : undefined,
          sortBy: currentSortField
            ? (fieldMapping[currentSortField] ?? currentSortField)
            : undefined,
          sortOrder: convertLsegSortOrder(currentSortType)
        })
      );
    },
    [dispatch, sortField, sortType, symbol]
  );

  useEffect(() => {
    fetchLsegSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  useEffect(() => {
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    fetchLsegSelection({
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    });
  }, [fetchLsegSelection, pagination.currentPage, pagination.pageSize]);

  const renderSummaryPopoverCell = useCallback(
    (title: string, value: string | null | undefined) => {
      if (!value?.trim()) return '-';

      const summaryItems = parseSummaryLines(value);

      return (
        <Popover
          color={popoverBackgroundColor}
          content={
            <div css={popoverContentStyles}>
              <div css={popoverHeaderStyles}>
                <div css={popoverTitleStyles}>{title}</div>
              </div>
              <div css={popoverBodyStyles}>
                <div css={popoverGridStyles}>
                  {summaryItems.map((item, index) => (
                    <div key={`${item.label}-${index}`} css={popoverRowStyles}>
                      <span css={popoverLabelStyles}>{item.label}</span>
                      <span css={popoverValueStyles}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
          trigger='click'
          placement='rightTop'
          overlayStyle={{
            padding: 0,
            ['--antd-arrow-background-color' as any]: popoverBackgroundColor
          }}
          overlayInnerStyle={{
            background: popoverBackgroundColor,
            border: `1px solid ${popoverBorderColor}`,
            borderRadius: '0.8rem',
            padding: 0
          }}
        >
          <Button type='text' css={starButtonStyles}>
            <span css={starButtonContentStyles}>Open</span>
          </Button>
        </Popover>
      );
    },
    [popoverBackgroundColor, popoverBorderColor]
  );

  const columns: TableColumnsType<LsegSelection> = [
    {
      title: t('stt'),
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
      width: 170,
      fixed: 'left',
      render: (_, record) => (
        <SymbolCell symbol={record.symbol} companyName={record.company} />
      )
    },
    {
      title: t('lsegRanking'),
      dataIndex: 'lsegRanking',
      key: 'lsegRanking',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'lsegRanking' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('lsegRanking')
      }),
      align: 'center',
      render: renderTextCell
    },
    {
      title: t('lsegRankingSummary'),
      dataIndex: 'lsegRankingSummary',
      key: 'lsegRankingSummary',
      width: 180,
      align: 'center',
      render: (value) =>
        renderSummaryPopoverCell(t('lsegRankingSummary'), value)
    },
    {
      title: t('marketPsychSummary'),
      dataIndex: 'marketPsychSummary',
      key: 'marketPsychSummary',
      width: 180,
      align: 'center',
      render: (value) =>
        renderSummaryPopoverCell(t('marketPsychSummary'), value)
    },
    {
      title: t('lsegNewsSummary'),
      dataIndex: 'lsegNewsSummary',
      key: 'lsegNewsSummary',
      width: 180,
      align: 'center',
      render: (value) => renderSummaryPopoverCell(t('lsegNewsSummary'), value)
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
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={2} /> : '-'
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
      render: (value) =>
        value ? <EllipsisText text={value} maxLines={2} /> : '-'
    },
    {
      title: t('marketCap'),
      dataIndex: 'marketCapSelection',
      key: 'marketCapSelection',
      width: 130,
      defaultSortOrder: 'descend',
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketCapSelection' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketCapSelection')
      }),
      align: 'center',
      render: (value) =>
        isNumeric(value) ? formatMarketCap(value as number) : '-'
    },
    {
      title: t('avgVolume'),
      dataIndex: 'avgVol',
      key: 'avgVol',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'avgVol' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('avgVol')
      }),
      align: 'center',
      render: (value) =>
        isNumeric(value) ? formatNumberShort(value as number) : '-'
    },
    {
      title: t('lsegStarmine'),
      dataIndex: 'starEq',
      key: 'star',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const availableStarCount = getAvailableStarCount(record);

        if (!availableStarCount) return '-';

        const starItems = [
          { label: 'EQ', value: record.starEq },
          { label: t('combinedAlpha'), value: record.starCombinedAlpha },
          { label: t('priceMomentum'), value: record.starPriceMomentum },
          { label: t('valueMomentum'), value: record.starValueMomentum },
          { label: t('armGlobal'), value: record.starArmGlobal },
          { label: t('armSector'), value: record.starArmSector },
          { label: t('armRegion'), value: record.starArmRegion },
          {
            label: t('predictedSurpriseEps'),
            value: record.starPredictedSurpriseEps
          },
          { label: t('analystRevUp'), value: record.starNumbAnalystRevUp },
          {
            label: t('analystRevDown'),
            value: record.starNumbAnalystRevDown
          },
          { label: t('recommendation'), value: record.starRecommendation },
          { label: `${t('rsi')} 14`, value: record.starRsi14 },
          { label: t('beta'), value: record.starBeta },
          { label: t('analystCount'), value: record.starNumbAnalyst },
          {
            label: t('epsSmartEstimate'),
            value: record.starEpsSmartEstimate
          },
          { label: t('epsMean'), value: record.starEpsMean }
        ];

        return (
          <Popover
            color={popoverBackgroundColor}
            content={
              <div css={popoverContentStyles}>
                <div css={popoverHeaderStyles}>
                  <div css={popoverTitleStyles}>{t('starMetrics')}</div>
                </div>
                <div css={popoverBodyStyles}>
                  <div css={popoverGridStyles}>
                    {starItems.map((item) => (
                      <div key={item.label} css={popoverRowStyles}>
                        <span css={popoverLabelStyles}>{item.label}</span>
                        <span css={popoverValueStyles}>
                          {typeof item.value === 'string' ||
                          typeof item.value === 'number' ||
                          item.value == null
                            ? formatStarValue(item.value)
                            : item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
            trigger='click'
            placement='rightTop'
            overlayStyle={{
              padding: 0,
              ['--antd-arrow-background-color' as any]: popoverBackgroundColor
            }}
            overlayInnerStyle={{
              background: popoverBackgroundColor,
              border: `1px solid ${popoverBorderColor}`,
              borderRadius: '0.8rem',
              padding: 0
            }}
          >
            <Button type='text' css={starButtonStyles}>
              <span css={starButtonContentStyles}>Open</span>
            </Button>
          </Popover>
        );
      }
    },
    {
      title: t('priceUp'),
      dataIndex: 'marketPsychPriceUp',
      key: 'marketPsychPriceUp',
      width: 100,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketPsychPriceUp' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketPsychPriceUp')
      }),
      align: 'center',
      render: renderSentimentCell
    },
    {
      title: t('priceMomentum'),
      dataIndex: 'marketPsychPriceMomentum',
      key: 'marketPsychPriceMomentum',
      width: 150,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketPsychPriceMomentum' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketPsychPriceMomentum')
      }),
      align: 'center',
      render: renderSentimentCell
    },
    {
      title: t('optimism'),
      dataIndex: 'marketPsychOptimism',
      key: 'marketPsychOptimism',
      width: 110,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketPsychOptimism' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketPsychOptimism')
      }),
      align: 'center',
      render: renderSentimentCell
    },
    {
      title: t('marketRisk'),
      dataIndex: 'marketPsychMarketRisk',
      key: 'marketPsychMarketRisk',
      width: 130,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketPsychMarketRisk' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketPsychMarketRisk')
      }),
      align: 'center',
      render: renderSentimentCell
    },
    {
      title: t('news1dScore'),
      dataIndex: 'news1dScore',
      key: 'news1dScore',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'news1dScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('news1dScore')
      }),
      align: 'center',
      render: renderSentimentCell
    },
    {
      title: t('news3dScore'),
      dataIndex: 'news3dScore',
      key: 'news3dScore',
      width: 140,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'news3dScore' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('news3dScore')
      }),
      align: 'center',
      render: renderSentimentCell
    },
    {
      title: t('negativeArticles12h'),
      dataIndex: 'newsNegativeArticleLast12h',
      key: 'newsNegativeArticleLast12h',
      width: 170,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'newsNegativeArticleLast12h' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('newsNegativeArticleLast12h')
      }),
      align: 'center',
      render: (value) =>
        value === 0 || value === 1 ? (
          <span css={newsNegativeValueStyles(value === 1)}>
            {value === 1 ? t('yes') : t('no')}
          </span>
        ) : (
          '-'
        )
    },
    {
      title: t('marketPsychology'),
      dataIndex: 'marketPsychUpdateOn',
      key: 'marketPsychUpdateOn',
      width: 180,
      sorter: true,
      showSorterTooltip: false,
      sortOrder: sortField === 'marketPsychUpdateOn' ? sortType : null,
      onHeaderCell: () => ({
        onClick: () => handleSortOrder('marketPsychUpdateOn')
      }),
      align: 'center',
      render: (value) => (value ? <DateTimeCell value={value} /> : '-')
    }
  ];

  return (
    <div css={rootStyles}>
      <div css={tableWrapperStyles}>
        <div css={tableTopStyles}>
          <div css={tableTopRightStyles}>
            <TableTitle customStyles={titleStyles}>
              <span>{t('lsegSelection')}</span>
              <Tooltip title={!isMobile && t('refresh')}>
                <Button
                  onClick={handleRefresh}
                  type='text'
                  css={refreshIconBtnStyles}
                  icon={
                    <Icon
                      customStyles={iconStyles}
                      icon='refresh'
                      width={22}
                      height={22}
                      fill='var(--text-color)'
                    />
                  }
                />
              </Tooltip>
            </TableTitle>
          </div>
        </div>
        <Table<LsegSelection>
          css={tableStyles}
          size={isMobile ? 'small' : 'middle'}
          rowKey='key'
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{
            x: 2900,
            y: data.length > 0 ? height - 246 : undefined
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
            pageSizeOptions: ['10', '20', '50', '100', '200'],
            showSizeChanger: true,
            showQuickJumper: true,
            current: pagination.currentPage,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page, pageSize) => {
              fetchLsegSelection({ page, pageSize });
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
  gap: 1.2rem;
`;

const tableWrapperStyles = css`
  border: 1px solid var(--border-table-color);
  border-radius: 0.8rem;
`;

const tableTopStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  padding: ${isMobile ? '1.2rem' : '1.2rem 1.4rem'};
  gap: 1.4rem;
`;

const tableStyles = css`
  .ant-table-cell {
    padding: ${isMobile
      ? '0.6rem 0.8rem !important'
      : '0.8rem 1rem !important'};
  }
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

const tableTopRightStyles = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const iconStyles = css`
  margin-top: 0.2rem;
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

const starButtonStyles = css`
  color: var(--text-color);
  padding: 0 !important;
  height: auto;
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

const starButtonContentStyles = css`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  color: var(--primary-color);
`;

const popoverContentStyles = css`
  width: min(34rem, 80vw);
`;

const popoverHeaderStyles = css`
  padding: 1.2rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
`;

const popoverTitleStyles = css`
  font-size: 1.4rem;
  font-weight: 700;
`;

const popoverBodyStyles = css`
  padding: 1.2rem;
  max-height: min(42rem, calc(100vh - 12rem));
  overflow-y: auto;
`;

const popoverGridStyles = css`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const popoverRowStyles = css`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  padding-bottom: 0.8rem;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const popoverLabelStyles = css`
  color: var(--text-secondary-color);
`;

const popoverValueStyles = css`
  text-align: right;
  font-weight: 600;
  white-space: pre-wrap;
  word-break: break-word;
`;

const newsNegativeValueStyles = (isNegative: boolean) => css`
  color: ${isNegative ? 'var(--negative-color)' : 'inherit'};
`;

const emptyStyles = (height: number) => css`
  height: ${height}px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
