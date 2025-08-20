/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useState } from 'react';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { Button } from 'antd';
import {
  capitalizeAllLetters,
  formatMarketCap,
  formatNumberShort,
  roundToDecimals
} from '@/utils/common';
import { Icon } from './icons';
import { defaultApiFetcher } from '@/utils/api-instances';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { transformWatchlistSwingTrade } from '@/helpers/swing-trading-watchlist.helper';
import { useTranslations } from 'next-intl';
import { TimeZone } from '@/constants/timezone.constant';

export const ExportExcelSwingWatchlist = () => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: number | null | undefined) => {
    return !!value ? `$${roundToDecimals(value)}` : '-';
  };

  const formatPercent = (value: number | null | undefined) => {
    return !!value ? `${roundToDecimals(value)}%` : '-';
  };

  const handleExportExcelSignal = async () => {
    setLoading(true);
    const response = await defaultApiFetcher.get(
      'tickers/get-swing-trading-watchlist',
      {
        query: {
          page: 1,
          limit: PAGINATION_PARAMS.unLimit,
          sortField: fieldMapping.changeLowest50Realtime,
          sortType: 'asc'
        }
      }
    );
    handleExport(transformWatchlistSwingTrade(response.data.result));
    setLoading(false);
  };

  const handleExport = async (watchlist: WatchlistSwingTrade[]) => {
    if (watchlist.length > 0) {
      const processedData = watchlist.map((item) => {
        return {
          'No.': watchlist.indexOf(item) + 1,
          Symbol: item.symbol || '-',
          'Closing Time': item.timeAfter4pm
            ? dayjs(item.timeAfter4pm).utc().format('YYYY-MM-DD HH:mm')
            : '-',
          'Closing($)': formatCurrency(item.priceAfter4pm),
          'Closing(%)': item.closingPercent
            ? formatPercent(item.closingPercent)
            : '-',
          'After-Hours Time': item.timeAfter8pm
            ? dayjs(item.timeAfter8pm).utc().format('YYYY-MM-DD HH:mm')
            : '-',
          'After-Hours($)': formatCurrency(item.priceAfter8pm),
          'After-Hours(%)': item.afterHourPercent
            ? formatPercent(item.afterHourPercent)
            : '-',
          'Last Price': formatCurrency(item.lastPrice),
          'Change($)': formatCurrency(item.priceChange),
          'Change(%)': item.priceChangePercent
            ? formatPercent(item.priceChangePercent)
            : '-',
          RSI: item.rsi ?? '-',
          Open: item.priceBefore9am ?? '-',
          'Market Date Time': item.timeBefore9am
            ? dayjs(item.timeBefore9am).utc().format('YYYY-MM-DD HH:mm')
            : '-',
          'Lowest 50': formatCurrency(item.lowest50),
          'Lowest 50(%)': item.changeLowest50Realtime
            ? formatPercent(item.changeLowest50Realtime)
            : '-',
          'Highest 50': formatCurrency(item.highest50),
          'Lowest 20': formatCurrency(item.lowest20),
          'Lowest 20(%)': item.changeLowest20Realtime
            ? formatPercent(item.changeLowest20Realtime)
            : '-',
          'Highest 20': formatCurrency(item.highest20),
          'Lowest 10': formatCurrency(item.lowest10),
          'Change Lowest 10 (%)': item.changeLowest10Realtime
            ? formatPercent(item.changeLowest10Realtime)
            : '-',
          'Highest 10': formatCurrency(item.highest10),
          Period: item.period ?? '-',
          'AI Rating': item.AIRating || '-',
          'AI Recommendation': item.AIRecommendation
            ? capitalizeAllLetters(item.AIRecommendation)
            : '-',
          'AI Explain': item.AIExplain || '-',
          'Gap($)': item.gapUpDown ?? '-',
          'Gap(%)': item.percentGap ? formatPercent(item.percentGap) : '-',
          'Market Cap': item.marketCapWatchList
            ? formatMarketCap(item.marketCapWatchList)
            : '-',
          Volume: item.volumeAVG ? formatNumberShort(item.volumeAVG) : '-',
          Beta: item.beta ? roundToDecimals(item.beta) : '-',
          'YTD Return': item.YTDReturn ? formatPercent(item.YTDReturn) : '-',
          '1-Year Return': item.oneYearnReturn
            ? formatPercent(item.oneYearnReturn)
            : '-',
          'Performance Month': item.performanceMonth
            ? formatPercent(item.performanceMonth)
            : '-',
          'Performance Week': item.performanceWeek
            ? formatPercent(item.performanceWeek)
            : '-',
          'Average Price': formatCurrency(item.average),
          'Median Price': formatCurrency(item.median),
          'SMA 50 Days': formatCurrency(item.sma50),
          'SMA 20 Days': formatCurrency(item.sma20),
          Industry: item.industry || '-',
          Subindustry: item.subindustry || '-',
          Sector: item.sector || '-',
          'Yahoo Price Target Mean': formatCurrency(item.yahooPriceTargetMean),
          'Yahoo Price Target High': formatCurrency(item.yahooPriceTargetHigh),
          'Yahoo Price Target Low': formatCurrency(item.yahooPriceTargetLow),
          Buy: item.buy || '-',
          'Strong Buy': item.strongBuy || '-',
          Sell: item.sell || '-',
          'Strong Sell': item.strongSell || '-',
          'Created At': item.createdAt
            ? dayjs(item.createdAt).utc().format('YYYY-MM-DD HH:mm')
            : '-'
        };
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Swing Watchlist');

      // Add headers
      const headers = Object.keys(processedData[0]);
      worksheet.addRow(headers);

      // Style headers
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      // Add data rows
      processedData.forEach((item) => {
        worksheet.addRow(Object.values(item));
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const fileName = `Swing_watchlist_${dayjs()
        .tz(TimeZone.NEW_YORK)
        .format('MM-DD-YYYY_HH-mm')}.xlsx`;
      link.download = fileName;
      link.click();
    } else {
      console.log('Failed to fetch data for export.', { variant: 'error' });
    }
  };

  return (
    <Button
      css={buttonStyles}
      type='primary'
      onClick={handleExportExcelSignal}
      disabled={loading}
      loading={loading}
      icon={
        !loading ? (
          <Icon
            icon='exportExcel'
            width={18}
            height={18}
            fill='var(--white-color)'
          />
        ) : undefined
      }
    >
      {t('exportExcel')}
    </Button>
  );
};

const buttonStyles = css`
  background: var(--green-color);
  &:hover {
    background: var(--green-color) !important;
    opacity: 0.9;
  }
`;
