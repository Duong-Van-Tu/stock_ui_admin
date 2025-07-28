/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useState } from 'react';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { Button } from 'antd';
import {
  capitalizeAllLetters,
  formatMarketCap,
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
          sortField: fieldMapping.marketCapWatchList,
          sortType: 'desc'
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
          Period: item.period || '-',
          'Price before 9AM': formatCurrency(item.priceBefore9am),
          'Time before 9AM': item.timeBefore9am
            ? dayjs(item.timeBefore9am).utc().format('YYYY-MM-DD HH:mm')
            : '-',
          'Price after 4PM': formatCurrency(item.priceAfter4pm),
          'Time after 4PM': item.timeAfter4pm
            ? dayjs(item.timeAfter4pm).utc().format('YYYY-MM-DD HH:mm')
            : '-',
          'Price after 8PM': formatCurrency(item.priceAfter8pm),
          'Time after 8PM': item.timeAfter8pm
            ? dayjs(item.timeAfter8pm).utc().format('YYYY-MM-DD HH:mm')
            : '-',
          'Gap type': item.gapType || '-',
          'Gap percent': formatPercent(item.percentGap),
          'AI Rating': item.AIRating || '-',
          'AI Recommendation': item.AIRecommendation
            ? capitalizeAllLetters(item.AIRecommendation)
            : '-',
          'AI Explanation': item.AIExplain || '-',
          'Previous Close': formatCurrency(item.previousClose),
          'Current Price': formatCurrency(item.currentPriceWatchlist),
          'Lowest 50': formatCurrency(item.lowest50),
          'Change Lowest 50 (%)': formatPercent(item.changeLowest50Realtime),
          'Highest 50': formatCurrency(item.highest50),
          'Lowest 20': formatCurrency(item.lowest20),
          'Change Lowest 20 (%)': formatPercent(item.changeLowest20Realtime),
          'Highest 20': formatCurrency(item.highest20),
          'Lowest 10': formatCurrency(item.lowest10),
          'Change Lowest 10 (%)': formatPercent(item.changeLowest10Realtime),
          'Highest 10': formatCurrency(item.highest10),
          'Average Price': formatCurrency(item.average),
          'Median Price': formatCurrency(item.median),
          'SMA 50 Days': formatCurrency(item.sma50),
          'SMA 20 Days': formatCurrency(item.sma20),
          'Yahoo Price Target Mean': formatCurrency(item.yahooPriceTargetMean),
          'Yahoo Price Target High': formatCurrency(item.yahooPriceTargetHigh),
          'Yahoo Price Target Low': formatCurrency(item.yahooPriceTargetLow),
          'Market Cap': item.marketCapWatchList
            ? formatMarketCap(item.marketCapWatchList)
            : '-',
          Industry: item.industry || '-',
          Subindustry: item.subindustry || '-',
          Sector: item.sector || '-',
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
