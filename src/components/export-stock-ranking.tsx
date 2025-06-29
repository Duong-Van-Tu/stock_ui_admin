/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useState } from 'react';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { Button } from 'antd';
import { roundToDecimals } from '@/utils/common';
import { Icon } from './icons';
import { defaultApiFetcher } from '@/utils/api-instances';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { useTranslations } from 'next-intl';
import { fieldMapping } from '@/helpers/field-mapping.helper';
import { transformStockScoreData } from '@/helpers/stock-core.helper';

export const ExportExcelStockRanking = () => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const formatNumber = (value: number | null | undefined) => {
    return value !== null && value !== undefined
      ? roundToDecimals(value, 2)
      : '-';
  };

  const formatPrice = (value: number | null | undefined) => {
    return value !== null && value !== undefined
      ? `$${roundToDecimals(value, 2)}`
      : '-';
  };

  const handleExportExcelStockRanking = async () => {
    setLoading(true);
    const response = await defaultApiFetcher.get('stock-scores', {
      query: {
        page: 1,
        limit: PAGINATION_PARAMS.unLimit,
        sortField: fieldMapping.totalScore || 'totalScore',
        sortType: 'desc'
      }
    });
    handleExport(transformStockScoreData(response.data.result));
    setLoading(false);
  };

  const handleExport = async (stockRankings: StockScore[]) => {
    if (stockRankings.length > 0) {
      const processedData = stockRankings.map((item) => {
        return {
          Symbol: item.symbol || '-',
          'Company Name': item.companyName || '-',
          'Total Score': formatNumber(item.totalScore),
          'Fundamental Score': formatNumber(item.fundamentalScore),
          'Sentiment Score': formatNumber(item.sentimentScore),
          'Earnings Score': formatNumber(item.earningsScore),
          'YTD (%)': formatNumber(item.ytd),
          'Day Change (%)': formatNumber(item.dayChangePercent),
          'Current Price': formatPrice(item.price),
          Volume: formatNumber(item.volume),
          Beta: formatNumber(item.beta),
          ATR: formatNumber(item.atr)
        };
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Stock Ranking');

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

      // Auto-width columns
      worksheet.columns = headers.map((header) => ({
        header,
        width: header.length + 10 // Add some padding
      }));

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Stock_Ranking_${dayjs().format('MM-DD-YYYY_HH-mm')}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      console.log('Failed to fetch data for export.', { variant: 'error' });
    }
  };

  return (
    <Button
      css={buttonStyles}
      type='primary'
      onClick={handleExportExcelStockRanking}
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
