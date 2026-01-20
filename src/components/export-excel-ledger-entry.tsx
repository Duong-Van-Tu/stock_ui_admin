/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useState } from 'react';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { Button } from 'antd';
import { useAppSelector } from '@/redux/hooks';
import {
  watchBalanceMap,
  watchCumulativeMap,
  watchLedgerEntry
} from '@/redux/slices/ledger-entry.slice';
import {
  formatDateTime,
  formatDateToDDMMYYYY,
  isNumeric,
  roundToDecimals
} from '@/utils/common';
import { Icon } from './icons';
import { useTranslations } from 'next-intl';
import { TimeZone } from '@/constants/timezone.constant';
import { calculateDIM } from '@/helpers/ledger-entry.helper';

type ExportExcelLedgerEntryProps = {
  initialBalance: number;
};

export const ExportExcelLedgerEntry = ({
  initialBalance
}: ExportExcelLedgerEntryProps) => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const LedgerEntry = useAppSelector(watchLedgerEntry);
  const cumulativeMap = useAppSelector(watchCumulativeMap);
  const balanceMap = useAppSelector(watchBalanceMap);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    const roundedValue = roundToDecimals(value) as number;
    return roundedValue < 0
      ? `($${Math.abs(roundedValue)})`
      : `$${roundedValue}`;
  };

  const formatPercent = (value: number | null | undefined) => {
    return !!value ? `${roundToDecimals(value)}%` : '-';
  };

  const handleExportLedger = async () => {
    if (
      !LedgerEntry.length ||
      !Object.keys(cumulativeMap).length ||
      !Object.keys(balanceMap).length
    ) {
      console.warn('Ledger data is empty or not yet loaded.');
      return;
    }

    setLoading(true);

    try {
      const processedData = LedgerEntry.map((item) => {
        const {
          investmentCashIn = 0,
          investmentCashOut = 0,
          exitPrice = 0,
          entryPrice = 0,
          commission = 0,
          entryDate,
          exitDate
        } = item;

        const winOrLoss =
          isNumeric(investmentCashIn) && isNumeric(investmentCashOut)
            ? investmentCashIn - investmentCashOut - commission
            : null;

        const plAmount =
          isNumeric(investmentCashIn) && isNumeric(investmentCashOut)
            ? investmentCashIn - investmentCashOut - commission
            : null;

        const plPercent =
          plAmount !== null ? (plAmount / investmentCashOut) * 100 : null;

        const cumulative = cumulativeMap[item.id];
        const cumulativePercent =
          cumulative != null ? (cumulative / initialBalance) * 100 : null;

        const balance = balanceMap[item.id];

        const stockPLPercent =
          entryPrice != null && exitPrice != null && entryPrice !== 0
            ? ((exitPrice - entryPrice) / entryPrice) * 100
            : null;

        const holdingDays = calculateDIM(entryDate, exitDate);

        return {
          Strategy: item.strategy || '-',
          'Entry Date': item.entryDate ? formatDateTime(item.entryDate) : '-',
          'Exit Date': formatDateTime(item.exitDate),
          DIM: holdingDays,
          Period: item.period || '-',
          Symbol: item.symbol || '-',
          'Win/Loss': winOrLoss ? (winOrLoss >= 0 ? 'Win' : 'Loss') : '-',
          Action: item.action ?? '-',
          Strike: formatCurrency(item.strike),
          Expiration: item.expiration
            ? formatDateToDDMMYYYY(item.expiration)
            : '-',
          'Premium Paid': formatCurrency(item.premiumPaid),
          'Premium Received': formatCurrency(item.premiumReceive),
          'No. of Contracts': item.contracts ?? '-',
          'Investment Cash Out': isNumeric(investmentCashOut)
            ? investmentCashOut
            : '-',
          'Investment Cash In': isNumeric(investmentCashIn)
            ? investmentCashIn
            : '-',
          Commission: isNumeric(item.commission)
            ? formatCurrency(item.commission)
            : '-',
          'P/L Amount': formatCurrency(plAmount),
          'P/L (%)': formatPercent(plPercent),
          'Cumulative Gain/Loss': formatCurrency(cumulative),
          'Cumulative Gain/Loss (%)': formatPercent(cumulativePercent),
          'Balance (5000$)': formatCurrency(balance),
          'Entry Price': formatCurrency(item.entryPrice),
          'Exit Price': formatCurrency(item.exitPrice),
          'Stock P/L (%)': formatPercent(stockPLPercent),
          Sector: item.sector || '-',
          Notes: item.notes || '-'
        };
      });

      if (!processedData.length) {
        console.warn('No data to export.');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Ledger Entry');

      const headers = Object.keys(processedData[0]);

      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: header.length + 2
      }));

      processedData.forEach((item) => {
        const rowData = headers.map((key) => {
          const value = item[key as keyof typeof item];
          return value === undefined || value === null ? '-' : value;
        });
        worksheet.addRow(rowData).commit();
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const fileName = `Ledger_Entry_${dayjs()
        .tz(TimeZone.NEW_YORK)
        .format('MM-DD-YYYY_HH-mm')}.xlsx`;
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error('Error exporting ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      css={buttonStyles}
      type='primary'
      onClick={handleExportLedger}
      disabled={loading}
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
