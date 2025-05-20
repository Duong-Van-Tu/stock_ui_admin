/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useContext, useState } from 'react';
import { Button } from 'antd';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { TimeZone } from '@/constants/timezone.constant';
import { formatPercent, roundToDecimals } from '@/utils/common';
import { SocketContext } from '@/providers/socket.provider';
import { Icon } from './icons';
import { defaultApiFetcher } from '@/utils/api-instances';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { transformSignalsData } from '@/helpers/signals.helper';
import { useTranslations } from 'next-intl';

export const ExportExcelLog = () => {
  const t = useTranslations();
  const { setWatchList, resFromWS } = useContext(SocketContext);
  const [loading, setLoading] = useState(false);

  const fetchSignals = async () => {
    setLoading(true);
    const response = await defaultApiFetcher.get(
      'tickers/get-stock-alert-log',
      {
        query: {
          page: 1,
          limit: PAGINATION_PARAMS.unLimit,
          sortField: fieldMapping.entryDate,
          sortType: 'desc'
        }
      }
    );
    handleExport(transformSignalsData(response.data.result));
    setLoading(false);
  };

  const handleExport = async (signals: Signal[]) => {
    if (signals.length > 0) {
      signals.forEach((row: Signal) => {
        setWatchList(row.symbol);
      });
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Export Data');

      const headers = [
        'Symbol',
        'Strategy',
        'STOCK/OPTIONS',
        'Period',
        'AI Rating',
        'AI Recommendation',
        'AI Explain',
        'Entry date',
        'Entry price',
        'Exit date',
        'Exit price',
        'Exit price (%)',
        'Win/Loss',
        'Current price',
        'Current %',
        'Highest price',
        'Highest %',
        'Highest price date',
        'Lowest price',
        'Lowest %',
        'Lowest price date',
        'Highest price 3 days',
        'Highest % 3 days',
        'Highest price date 3 days',
        'Lowest price 3 days',
        'Lowest % 3 days',
        'Lowest price date 3 days',
        'Highest price 7 days',
        'Highest % 7 days',
        'Highest price date 7 days',
        'Lowest price 7 days',
        'Lowest % 7 days',
        'Lowest price date 7 days',
        'Negative News price',
        'Earnings next 3 days',
        'Total score',
        'Fundamental score',
        'Earnings score',
        'Sentiment score',
        'YTD'
      ];
      worksheet.addRow(headers);

      worksheet.columns = headers.map((header) => {
        let width = header.length + 1;
        if (header.toLowerCase().includes('date')) {
          width = 18;
        }
        if (header === 'Strategy') {
          width = 32;
        }

        if (header === 'YTD') {
          width = 10;
        }

        return { header, width };
      });

      worksheet.eachRow((row) => {
        row.eachCell((cell, colIndex) => {
          if (colIndex <= 3) {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          }
        });
      });

      const calculatePLValues = (price: number, entryPrice: number) => {
        if (!price || isNaN(price)) {
          return {
            price: '-',
            percent: '-',
            color: '000000'
          };
        }
        const change = price - entryPrice;
        const percentChange = entryPrice ? (change / entryPrice) * 100 : 0;
        // Color calculation kept for future use, no styling applied now
        const color = change > 0 ? '008000' : change < 0 ? 'FF0000' : '000000';

        return {
          price: roundToDecimals(price, 2),
          percent: formatPercent(percentChange),
          color
        };
      };

      // Removed getScoreColor because not used for styling now
      signals.forEach((log: Signal) => {
        const realtime = resFromWS.realtime.find(
          (r: any) => r.symbol === log.symbol
        );
        const currPrice = realtime?.close || log.currentPrice;
        const baseEntry = log.entryPrice;

        const currentPL = calculatePLValues(currPrice, baseEntry);
        const highestPL = calculatePLValues(log.highestPrice, baseEntry);
        const lowestPL = calculatePLValues(log.lowestPrice, baseEntry);
        const high3dPL = calculatePLValues(log.highestPrice3Days, baseEntry);
        const low3dPL = calculatePLValues(log.lowestPrice3Days, baseEntry);
        const high7dPL = calculatePLValues(log.highestPrice7Days, baseEntry);
        const low7dPL = calculatePLValues(log.lowestPrice7Days, baseEntry);
        const negativeNews = !!log.isNewsNegative ? 'Yes' : 'No';

        worksheet.addRow([
          log.symbol,
          log.strategyName,
          log.isImport === 0 ? 'STOCK' : 'OPTIONS',
          log.timeFrame,
          log.AIRating,
          log.AIRecommendationSignal ?? '-',
          log.AIExplain ?? '-',
          log.entryDate
            ? dayjs(log.entryDate)
                .tz(TimeZone.NEW_YORK)
                .format('YYYY-MM-DD HH:mm')
            : '-',
          baseEntry ? roundToDecimals(baseEntry, 2) : '-',
          log.exitDate
            ? dayjs(log.exitDate)
                .tz(TimeZone.NEW_YORK)
                .format('YYYY-MM-DD HH:mm')
            : '-',
          log.exitPrice ? roundToDecimals(log.exitPrice, 2) : '-',
          log.plPercent ? formatPercent(log.plPercent) : '-',
          log.plPercent > 0 ? 'Win' : log.plPercent < 0 ? 'Loss' : '-',
          currentPL.price,
          currentPL.percent,
          highestPL.price,
          highestPL.percent,
          log.highestUpdateAt
            ? dayjs(log.highestUpdateAt)
                .tz(TimeZone.NEW_YORK)
                .format('YYYY-MM-DD HH:mm')
            : '-',
          lowestPL.price,
          lowestPL.percent,
          log.lowestUpdateAt
            ? dayjs(log.lowestUpdateAt)
                .tz(TimeZone.NEW_YORK)
                .format('YYYY-MM-DD HH:mm')
            : '-',
          high3dPL.price,
          high3dPL.percent,
          log.highest3DaysUpdateAt
            ? dayjs(log.highest3DaysUpdateAt)
                .tz(TimeZone.NEW_YORK)
                .format('YYYY-MM-DD HH:mm')
            : '-',
          low3dPL.price,
          low3dPL.percent,
          log.lowest3DaysUpdateAt
            ? dayjs(log.lowest3DaysUpdateAt)
                .tz(TimeZone.NEW_YORK)
                .format('YYYY-MM-DD HH:mm')
            : '-',
          high7dPL.price,
          high7dPL.percent,
          log.highest7DaysUpdateAt
            ? dayjs(log.highest7DaysUpdateAt)
                .tz(TimeZone.NEW_YORK)
                .format('YYYY-MM-DD HH:mm')
            : '-',
          low7dPL.price,
          low7dPL.percent,
          log.lowest7DaysUpdateAt
            ? dayjs(log.lowest7DaysUpdateAt)
                .tz(TimeZone.NEW_YORK)
                .format('YYYY-MM-DD HH:mm')
            : '-',
          negativeNews,
          !!log.earningDate3days ? 'Yes' : 'No',
          log.totalScore ? roundToDecimals(log.totalScore, 2) : '-',
          log.fundamentalScore ? roundToDecimals(log.fundamentalScore, 2) : '-',
          log.earningsScore ? roundToDecimals(log.earningsScore, 2) : '-',
          log.sentimentScore ? roundToDecimals(log.sentimentScore, 2) : '-',
          log.ytd ? roundToDecimals(log.ytd, 2) : '-'
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const fileName = `Stock_History_Logs_${dayjs()
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
      loading={loading}
      icon={
        <Icon
          icon='exportExcel'
          width={18}
          height={18}
          fill='var(--white-color)'
        />
      }
      onClick={fetchSignals}
      disabled={loading}
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
