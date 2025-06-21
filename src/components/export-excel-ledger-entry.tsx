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
  roundToDecimals
} from '@/utils/common';
import { Icon } from './icons';
import { useTranslations } from 'next-intl';

const initialBalance = 5000;

export const ExportExcelLedgerEntry = () => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const LedgerEntry = useAppSelector(watchLedgerEntry);
  const cumulativeMap = useAppSelector(watchCumulativeMap);
  const balanceMap = useAppSelector(watchBalanceMap);

  const formatCurrency = (value: number | null | undefined) => {
    return !!value ? `$${roundToDecimals(value)}` : '-';
  };

  const formatPercent = (value: number | null | undefined) => {
    return !!value ? `${roundToDecimals(value)}%` : '-';
  };

  const handleExportLedger = async () => {
    setLoading(true);

    const processedData = LedgerEntry.map((item) => {
      const {
        investmentCashIn = 0,
        investmentCashOut = 0,
        exitPrice = 0,
        entryPrice = 0,
        commission = 0
      } = item;

      const winOrLoss =
        investmentCashIn &&
        investmentCashOut &&
        investmentCashIn - investmentCashOut - commission;

      const plAmount =
        investmentCashIn &&
        investmentCashOut &&
        investmentCashIn - investmentCashOut - commission;

      const plPercent = plAmount && (plAmount / investmentCashOut) * 100;

      const cumulative = cumulativeMap[item.id];
      const cumulativePercent =
        cumulative && (cumulative / initialBalance) * 100;

      const balance = balanceMap[item.id];

      const stockPLPercent =
        entryPrice &&
        exitPrice &&
        ((exitPrice - entryPrice) / entryPrice) * 100;

      return {
        Symbol: item.strategy || '-',
        Strategy: item.strategy || '-',
        Period: item.period || '-',
        'Win/Loss': winOrLoss ? (winOrLoss >= 0 ? 'Win' : 'Loss') : '-',
        'Entry Date': item.entryDate ? formatDateTime(item.entryDate) : '-',
        'Entry Price': formatCurrency(item.entryPrice),
        'Exit Date': formatDateTime(item.exitDate),
        'Exit Price': formatCurrency(item.exitPrice),
        'Stock P/L (%)': formatPercent(stockPLPercent),
        Action: item.action ? item.action : '-',
        Strike: formatCurrency(item.strike),
        Expiration: item.expiration
          ? formatDateToDDMMYYYY(item.expiration)
          : '-',
        'Premium Paid': formatCurrency(item.premiumPaid),
        'Premium Received': formatCurrency(item.premiumReceive),
        'Investment Cash Out': formatCurrency(item.investmentCashOut),
        'Investment Cash In': formatCurrency(item.investmentCashIn),
        'No. of Contracts': item.contracts ?? '-',
        Commission: formatCurrency(item.commission),
        'P/L Amount': formatCurrency(plAmount),
        'P/L (%)': formatPercent(plPercent),
        'Cumulative Gain/Loss': formatCurrency(cumulative),
        'Cumulative Gain/Loss (%)': formatPercent(cumulativePercent),
        'Balance (5000$)': formatCurrency(balance),
        Sector: item.sector || '-',
        Notes: item.notes || '-'
      };
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ledger Entry');

    const headers = Object.keys(processedData[0]);
    worksheet.addRow(headers);

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    processedData.forEach((item) => {
      worksheet.addRow(Object.values(item));
    });

    worksheet.columns.forEach((column) => {
      if (column.values) {
        const maxLength = Math.max(
          ...column.values.map((v) => (v ? v.toString().length : 0))
        );
        column.width = maxLength + 2;
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ledger_Entry_${dayjs().format('MM-DD-YYYY_HH-mm')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
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
