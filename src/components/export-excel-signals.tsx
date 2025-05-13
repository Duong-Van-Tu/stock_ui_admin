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
        'Entry date',
        'Entry price',
        'Exit date',
        'Exit price',
        'Win/Loss (%)',
        'Current price',
        'Current %',
        'Highest price',
        'Highest %',
        'Lowest price',
        'Lowest %',
        'Highest price after 3 days',
        'Highest % after 3 days',
        'Lowest price after 3 days',
        'Lowest % after 3 days',
        'Highest price after 7 days',
        'Highest % after 7 days',
        'Lowest price after 7 days',
        'Lowest % after 7 days',
        'Negative News price',
        'Earnings next 3 days',
        'Recommendation',
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
        const color = change > 0 ? '008000' : change < 0 ? 'FF0000' : '000000';

        return {
          price: roundToDecimals(price, 2),
          percent: formatPercent(percentChange),
          color
        };
      };

      const getScoreColor = (score: number) => {
        if (score > 7) return '008000';
        if (score > 4) return 'FFD700';
        return 'FF0000';
      };

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

        const row = worksheet.addRow([
          log.symbol,
          log.strategyName,
          log.isImport === 0 ? 'STOCK' : 'OPTIONS',
          log.timeFrame,
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
          currentPL.price,
          currentPL.percent,
          highestPL.price,
          highestPL.percent,
          lowestPL.price,
          lowestPL.percent,
          high3dPL.price,
          high3dPL.percent,
          low3dPL.price,
          low3dPL.percent,
          high7dPL.price,
          high7dPL.percent,
          low7dPL.price,
          low7dPL.percent,
          negativeNews,
          !!log.earningDate3days ? 'Yes' : 'No',
          log.recommendation
            ? `${roundToDecimals(log.recommendation, 2)}%`
            : '-',
          log.totalScore ? roundToDecimals(log.totalScore, 2) : '-',
          log.fundamentalScore ? roundToDecimals(log.fundamentalScore, 2) : '-',
          log.earningsScore ? roundToDecimals(log.earningsScore, 2) : '-',
          log.sentimentScore ? roundToDecimals(log.sentimentScore, 2) : '-',
          log.ytd ? roundToDecimals(log.ytd, 2) : '-'
        ]);

        const entryPriceCell = row.getCell(6);
        const exitPriceCell = row.getCell(8);
        const winLossCell = row.getCell(9);

        if (baseEntry !== undefined && !isNaN(baseEntry)) {
          entryPriceCell.font = { color: { argb: '000000' } };
        }

        if (log.exitPrice !== undefined && !isNaN(log.exitPrice)) {
          const exitColor =
            log.exitPrice > baseEntry
              ? '008000'
              : log.exitPrice < baseEntry
              ? 'FF0000'
              : '000000';
          exitPriceCell.font = { color: { argb: exitColor } };
        }

        if (log.plPercent !== undefined && !isNaN(log.plPercent)) {
          const plColor =
            log.plPercent > 0
              ? '008000'
              : log.plPercent < 0
              ? 'FF0000'
              : '000000';
          winLossCell.font = { color: { argb: plColor } };
        }

        const pricePercentIndexes = [
          10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
        ];
        const colorMap = [
          currentPL.color,
          currentPL.color,
          highestPL.color,
          highestPL.color,
          lowestPL.color,
          lowestPL.color,
          high3dPL.color,
          high3dPL.color,
          low3dPL.color,
          low3dPL.color,
          high7dPL.color,
          high7dPL.color,
          low7dPL.color,
          low7dPL.color
        ];

        pricePercentIndexes.forEach((cellIndex, i) => {
          row.getCell(cellIndex).font = { color: { argb: colorMap[i] } };
        });

        const totalScore = Number(log.totalScore ?? -1);
        const fundamentalScore = Number(log.fundamentalScore ?? -1);
        const earningsScore = Number(log.earningsScore ?? -1);
        const sentimentScore = Number(log.sentimentScore ?? -1);

        if (!isNaN(totalScore))
          row.getCell(27).font = { color: { argb: getScoreColor(totalScore) } };
        if (!isNaN(fundamentalScore))
          row.getCell(28).font = {
            color: { argb: getScoreColor(fundamentalScore) }
          };
        if (!isNaN(earningsScore))
          row.getCell(29).font = {
            color: { argb: getScoreColor(earningsScore) }
          };
        if (!isNaN(sentimentScore))
          row.getCell(30).font = {
            color: { argb: getScoreColor(sentimentScore) }
          };

        const ytdValue = Number(log.ytd ?? 0);
        if (!isNaN(ytdValue)) {
          const ytdColor =
            ytdValue > 0 ? '008000' : ytdValue < 0 ? 'FF0000' : '000000';
          row.getCell(31).font = { color: { argb: ytdColor } };
        }

        const negativeNewsCell = row.getCell(24);
        const earningDate3DaysCell = row.getCell(25);

        negativeNewsCell.font = {
          color: { argb: log.isNewsNegative ? '008000' : 'FF0000' }
        };
        earningDate3DaysCell.font = {
          color: { argb: log.earningDate3days ? '008000' : 'FF0000' }
        };
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
    opacity: 0.85;
  }
`;
