import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';
import {
  parseConsoleObject,
  parseToUTC,
  scaleScore,
  tidyTime
} from '@/utils/common';
import { toNumber } from 'lodash';

const UNUSED_IDS = [4, 7, 8];

export type LsegStarmineItem =
  | { type: 'metric'; label: string; value: string }
  | { type: 'text'; value: string };

export type LsegStarmineSection = {
  title?: string;
  items: LsegStarmineItem[];
};

const getDisplayText = (value: unknown) => {
  if (value == null) return '-';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' ? '-' : trimmed;
  }

  return String(value);
};

export const parseLsegStarmine = (value: unknown): LsegStarmineSection[] => {
  const text = getDisplayText(value);
  if (text === '-') return [];

  const sections: LsegStarmineSection[] = [];
  let currentSection: LsegStarmineSection = { items: [] };

  const pushCurrentSection = () => {
    if (currentSection.title || currentSection.items.length > 0) {
      sections.push(currentSection);
    }
  };

  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separatorIndex = line.indexOf(':');

      if (separatorIndex === -1) {
        currentSection.items.push({ type: 'text', value: line });
        return;
      }

      const label = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      const normalizedLabel = label.toLowerCase();

      if (normalizedLabel === 'updated at') {
        return;
      }

      const isSectionTitle =
        rawValue === '' &&
        label === label.toUpperCase() &&
        /^[A-Z0-9/&()\s-]+$/.test(label) &&
        label.length <= 12;

      if (isSectionTitle) {
        pushCurrentSection();
        currentSection = { title: label, items: [] };
        return;
      }

      currentSection.items.push({
        type: 'metric',
        label,
        value: rawValue || '-'
      });
    });

  pushCurrentSection();
  return sections;
};

export const hasLsegStarmineData = (value: unknown) =>
  parseLsegStarmine(value).some((section) =>
    section.items.some((item) => item.value.trim() !== '-')
  );

export const transformStrategyData = (strategies: any[]): Strategies => {
  return strategies
    .filter((strategy) => !UNUSED_IDS.includes(strategy.id))
    .map((strategy) => ({
      id: strategy.id,
      name: strategy.name,
      groupName: strategy.group_name,
      description: strategy.description
    }));
};

export const transformLatestHitOnePercentData = (data: any[]): string[] => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => item[fieldMapping.tickerName]);
  //   id: item.id,
  //   tickerName: item[fieldMapping.tickerName],
  //   currentPrice: item[fieldMapping.currentPrice],
  //   entryDate: item[fieldMapping.entryDate],
  //   entryPrice: item[fieldMapping.entryPrice],
  //   highestUpdateAt: item[fieldMapping.highestUpdateAt],
  //   highestPrice: item[fieldMapping.highestPrice],
  //   hitPercent: item[fieldMapping.hitPercent]
  // }));
};

export const transformSignalsData = (signals: any[]): Signal[] => {
  if (signals.length <= 0) return [];

  return signals.map((stock) => {
    const co = stock[fieldMapping.consoleObject]
      ? parseConsoleObject(stock[fieldMapping.consoleObject])
      : undefined;

    const spikeBar = co?.spikeBar;
    const confirmBar = co?.confirmBar;

    return {
      id: stock.id,
      key: uuid(),
      hashAlertLogId: stock[fieldMapping.hashAlertLogId],
      symbol: stock[fieldMapping.tickerName],
      companyName: stock[fieldMapping.companyName],
      earningDate: stock[fieldMapping.earningDate],
      isNews: stock[fieldMapping.isNews],
      is_have_news: stock[fieldMapping.is_have_news],
      totalScore: stock[fieldMapping.totalScore],
      fundamentalScore: stock[fieldMapping.fundamentalScore],
      sentimentScore: stock[fieldMapping.sentimentScore],
      earningsScore: stock[fieldMapping.earningsScore],
      ytd: stock[fieldMapping.ytd],
      currentPrice: stock[fieldMapping.currentPrice],
      volumeAVG: stock[fieldMapping.volumeAVG],
      beta: stock.beta,
      atr: stock.atr,
      strategyName: stock[fieldMapping.strategyName],
      timeFrame: stock[fieldMapping.timeFrame],
      entryDate: stock[fieldMapping.entryDate],
      entryPrice: Number(stock[fieldMapping.entryPrice] ?? 0),
      exitDate: stock[fieldMapping.exitDate],
      exitPrice: Number(stock[fieldMapping.exitPrice] ?? 0),
      highestPrice: stock[fieldMapping.highestPrice],
      highestUpdateAt: stock[fieldMapping.highestUpdateAt],
      lowestPrice: stock[fieldMapping.lowestPrice],
      lowestUpdateAt: stock[fieldMapping.lowestUpdateAt],
      marketCap: Number(stock[fieldMapping.marketCap] ?? 0),
      plPercent: Number(stock[fieldMapping.plPercent] ?? 0),
      atrPercent: stock[fieldMapping.atrPercent],
      isNewsNegative: stock[fieldMapping.isNewsNegative],
      recentNewsEarnings: stock[fieldMapping.recentNewsEarnings],
      lowestPrice3Days: stock[fieldMapping.lowestPrice3Days],
      lowestPrice7Days: stock[fieldMapping.lowestPrice7Days],
      highestPrice3Days: stock[fieldMapping.highestPrice3Days],
      highestPrice7Days: stock[fieldMapping.highestPrice7Days],
      recommendation: stock.recommendation,
      isImport: stock[fieldMapping.isImport],
      earningDate3days: stock[fieldMapping.earningDate3days],
      isNotes: stock[fieldMapping.isNotes],
      scheduleExitDate: stock[fieldMapping.scheduleExitDate],
      lowest3DaysUpdateAt: stock[fieldMapping.lowest3DaysUpdateAt],
      lowest7DaysUpdateAt: stock[fieldMapping.lowest7DaysUpdateAt],
      highest3DaysUpdateAt: stock[fieldMapping.highest3DaysUpdateAt],
      highest7DaysUpdateAt: stock[fieldMapping.highest7DaysUpdateAt],
      AIRating: stock[fieldMapping.AIRating],
      AIRecommendationSignal: stock[fieldMapping.AIRecommendationSignal],
      AIExplain: stock[fieldMapping.AIExplain],
      grokRating: stock[fieldMapping.grokRating],
      grokRec: stock[fieldMapping.grokRec],
      grokReasoning: stock[fieldMapping.grokReasoning],
      realCandleEntry: parseToUTC(stock[fieldMapping.realCandleEntry]),
      expectCandleEntry: parseToUTC(stock[fieldMapping.expectCandleEntry]),
      manualRecommendation: stock[fieldMapping.manualRecommendation],
      stopLoss: Number(stock[fieldMapping.stopLoss]),
      takeProfit: Number(stock[fieldMapping.takeProfit]),
      highestPricePercent: stock[fieldMapping.highestPricePercent],
      lowestPricePercent: stock[fieldMapping.lowestPricePercent],
      currentPricePercent: stock[fieldMapping.currentPricePercent],
      isOptions: !!stock[fieldMapping.isOptions],
      categoryId: stock[fieldMapping.categoryId],
      categoryIds: stock[fieldMapping.categoryIds],
      newStopLoss: co?.newStopLoss ?? '',
      spikeVolumeM15Info:
        spikeBar || confirmBar
          ? {
              smaVol: toNumber(co?.smaVl ?? co?.smaVL) ?? 0,
              strikeVol: toNumber(spikeBar?.volumn) ?? 0,
              strikeTime: tidyTime(spikeBar?.spikeTime),
              confirmVol: toNumber(confirmBar?.confirmVol) ?? 0,
              confirmPrice: toNumber(confirmBar?.confirmPrice) ?? 0,
              confirmTime: tidyTime(confirmBar?.confirmTime)
            }
          : undefined,
      spikeVolumeH1Info: spikeBar
        ? {
            smaVol: toNumber(co?.smaVl ?? co?.smaVL) ?? 0,
            strikeVol: toNumber(spikeBar?.volumn) ?? 0,
            strikeTime: tidyTime(spikeBar?.spikeTime)
          }
        : undefined,

      rsi: stock.rsi,
      stockInfo: {
        totalScore: stock[fieldMapping.totalScore],
        fundamentalScore: stock[fieldMapping.fundamentalScore],
        sentimentScore: stock[fieldMapping.sentimentScore],
        earningsScore: stock[fieldMapping.earningsScore],
        performanceScore: stock[fieldMapping.performanceScore],
        beta: stock.beta,
        rsi: stock.rsi,
        atr: stock.atr
      },
      performanceScore: stock[fieldMapping.performanceScore],
      avgSentiment: stock[fieldMapping.avgSentiment],
      verifyNews: stock[fieldMapping.verifyNews],
      isPutOptions: stock[fieldMapping.isPutOptions],
      countSignal: stock[fieldMapping.countSignal]
        ? Number(stock[fieldMapping.countSignal])
        : 0,
      allEntryGood: !!stock[fieldMapping.allEntryGood],
      lsegNews: Number(stock[fieldMapping.lsegNews]),
      trend1h: stock[fieldMapping.trend1h],
      trend1d: stock[fieldMapping.trend1d],
      trend1w: stock[fieldMapping.trend1w],
      macd5m: stock[fieldMapping.macd5m],
      macd15m: stock[fieldMapping.macd15m],
      macd1h: stock[fieldMapping.macd1h],
      macd1d: stock[fieldMapping.macd1d],
      macd1w: stock[fieldMapping.macd1w],
      highest3DaysPricePct: stock[fieldMapping.highest3DaysPricePct],
      lowest3DaysPricePct: stock[fieldMapping.lowest3DaysPricePct],
      lowest7DaysPricePct: stock[fieldMapping.lowest7DaysPricePct],
      highest7DaysPricePct: stock[fieldMapping.highest7DaysPricePct],
      newsType: stock[fieldMapping.newsType],
      sentiment: scaleScore(stock.sentiment),
      articleScore: scaleScore(stock[fieldMapping.articleScore]),
      impactScore: scaleScore(stock[fieldMapping.impactScore]),
      storyId: co?.newsId,
      lsegStarmine: stock[fieldMapping.lsegStarmine]
    } as Signal;
  });
};

export const mobileColumnKeys = [
  'symbol',
  'is_have_news',
  'avgSentiment',
  'strategyName',
  'timeFrame',
  'AIRecommendationSignal',
  'manualRecommendation',
  'AIRating',
  'AIExplain',
  'entryDate',
  'entryPrice',
  'stopLoss',
  'newStopLoss',
  'takeProfit',
  'exitDate',
  'exitPrice',
  'currentPrice',
  'action'
];

export const transformLatestExitInTradeData = (
  data: any[]
): LatestExitInTrade[] => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    id: item.id,
    tickerName: item[fieldMapping.tickerName],
    companyName: item[fieldMapping.companyName],
    entryPrice: item[fieldMapping.entryPrice],
    entryDate: item[fieldMapping.entryDate],
    exitDate: item[fieldMapping.exitDate],
    exitPrice: Number(item[fieldMapping.exitPrice])
  }));
};

export const detailColumnKeys = [
  'index',
  'strategyName',
  'timeFrame',
  'manualRecommendation',
  'entryDate',
  'entryPrice',
  'currentPrice',
  'grokRating',
  'grokRec',
  'grokReasoning',
  'highestPrice',
  'highestPrice3Days',
  'lowestPrice3Days'
];
