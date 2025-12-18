import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';
import { parseConsoleObject, parseToUTC, tidyTime } from '@/utils/common';
import { toNumber } from 'lodash';

const UNUSED_IDS = [4, 7, 8];

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
      lsegNews: stock[fieldMapping.lsegNews]
    } as Signal;
  });
};

export const mobileColumnKeys = [
  'symbol',
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
