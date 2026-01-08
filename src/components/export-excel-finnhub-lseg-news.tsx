/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useState } from 'react';
import ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { Button } from 'antd';
import {
  roundToDecimals,
  cleanFalsyValues,
  convertParamsByMapping,
  formatPercent,
  capitalizeAllLetters
} from '@/utils/common';
import { Icon } from './icons';
import { defaultApiFetcher } from '@/utils/api-instances';
import { PAGINATION_PARAMS } from '@/constants/pagination.constant';
import { useTranslations } from 'next-intl';
import { TimeZone } from '@/constants/timezone.constant';
import { transformFinnhubAndLsegNews } from '@/helpers/sentiment.helper';

export const ExportExcelFinnhubLsegNews = ({
  filter
}: {
  filter: SentimentFilter;
}) => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);

  const handleExportExcelNews = async () => {
    setLoading(true);
    const filteredFilter = cleanFalsyValues(filter);
    const convertedFilter = convertParamsByMapping(filteredFilter);
    const response = await defaultApiFetcher.get('news/list', {
      query: {
        page: 1,
        limit: PAGINATION_PARAMS.unLimit,
        sortField: 'datetime',
        sortType: 'desc',
        ...convertedFilter
      }
    });
    const transformedNews = transformFinnhubAndLsegNews(response.data.result);
    handleExport(transformedNews);
    setLoading(false);
  };

  const handleExport = async (news: any[]) => {
    if (news.length > 0) {
      const processedData = news.map((item) => {
        return {
          'No.': news.indexOf(item) + 1,
          Symbol: item.symbol || '-',
          'Publishing Time': item.datetime
            ? dayjs(item.datetime).utc().format('YYYY-MM-DD HH:mm')
            : '-',
          Headline: item.headline || '-',
          Source: item.sourceType || '-',
          'News Type': item.newsType || '-',
          'Article Score': item.articleScore
            ? roundToDecimals(item.articleScore)
            : '-',
          'Impact Score': item.impactScore
            ? roundToDecimals(item.impactScore)
            : '-',
          'Sentiment Score': item.newsScore
            ? roundToDecimals(item.newsScore)
            : '-',
          Sector: item.sector || '-',
          Industry: item.industry || '-',
          Direction: item.direction || '-',
          Horizon: item.horizon || '-',
          Relevance: item.newsRelevance || '-',
          'Time Weight': item.timeWeight
            ? roundToDecimals(item.timeWeight)
            : '-',
          'Weighted Score': item.weightedScore
            ? roundToDecimals(item.weightedScore)
            : '-',
          'Grok Rating': item.grokRating
            ? roundToDecimals(item.grokRating)
            : '-',
          'Grok Recommendation': item.grokRec
            ? capitalizeAllLetters(item.grokRec)
            : '-',
          'Grok Reasoning': item.grokReasoning || '-',
          'Entry Date': item.entryDate
            ? dayjs(item.entryDate).utc().format('YYYY-MM-DD HH:mm')
            : '-',
          'Entry Price': item.entryPrice
            ? roundToDecimals(item.entryPrice)
            : '-',
          'Current Price': item.currentPrice
            ? roundToDecimals(item.currentPrice)
            : '-',
          'Current Price %': item.currentPricePct
            ? formatPercent(item.currentPricePct)
            : '-',
          'Highest Price': item.highestPrice
            ? roundToDecimals(item.highestPrice)
            : '-',
          'Highest Price %': item.highestPricePct
            ? formatPercent(item.highestPricePct)
            : '-',
          'Highest 3 Days Price': item.highest3DaysPrice
            ? roundToDecimals(item.highest3DaysPrice)
            : '-',
          'Highest 3 Days Price %': item.highest3DaysPricePct
            ? formatPercent(item.highest3DaysPricePct)
            : '-',
          'Lowest 3 Days Price': item.lowest3DaysPrice
            ? roundToDecimals(item.lowest3DaysPrice)
            : '-',
          'Lowest 3 Days Price %': item.lowest3DaysPricePct
            ? formatPercent(item.lowest3DaysPricePct)
            : '-'
        };
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Finnhub LSEG News');

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
      const fileName = `News_${dayjs()
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
      onClick={handleExportExcelNews}
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
