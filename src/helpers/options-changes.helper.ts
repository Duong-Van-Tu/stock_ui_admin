import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';
import dayjs from 'dayjs';

export const transformOptionChangesData = (rows: any[]): OptionChange[] => {
  if (!rows) return [];
  return rows.map((item) => {
    const rec = {
      key: uuid(),
      id: item.id,
      symbol: item.symbol,
      price: item.price,
      strike: item.strike,
      dte: item.dte,
      lastOptionPrice: Number(item[fieldMapping.lastOptionPrice]),
      expDate: item[fieldMapping.expDate]
        ? dayjs(item[fieldMapping.expDate]).format('MM-DD-YYYY')
        : '',
      optionType: item[fieldMapping.optionType],
      ask: item[fieldMapping.ask],
      nttAsk: item[fieldMapping.nttAsk],
      change: item[fieldMapping.change],
      changeValue: item[fieldMapping.changeValue],
      changePercent: item[fieldMapping.changePercent],
      delta: item[fieldMapping.delta],
      theta: item[fieldMapping.theta],
      vega: item[fieldMapping.vega],
      ivRank: item[fieldMapping.ivRank],
      impVol: item[fieldMapping.impVol],
      iv: item.iv,
      ivPctChg: item[fieldMapping.ivPctChg],
      itmProb: item[fieldMapping.itmProb],
      otmProb: item[fieldMapping.otmProb],
      volume: item[fieldMapping.volume],
      openInt: item[fieldMapping.openInt],
      costPerContract: item[fieldMapping.costPerContract],
      newStockPrice: item[fieldMapping.newStockPrice],
      optionPriceChange: item[fieldMapping.optionPriceChange],
      newOptionPremium: item[fieldMapping.newOptionPremium],
      newOptionContract: item[fieldMapping.newOptionContract],
      profitNoTheta: item[fieldMapping.profitNoTheta],
      newOptionPremiumTheta: item[fieldMapping.newOptionPremiumTheta],
      profitTheta: item[fieldMapping.profitTheta],
      mfpAsk: item[fieldMapping.mfpAsk],
      beAsk: Number(item[fieldMapping.beAsk]),
      beAskPercent: Number(item[fieldMapping.beAskPercent]),
      bidAsk: item[fieldMapping.bidAsk],
      moneyness: item[fieldMapping.moneyness],
      suggested: item[fieldMapping.isTop],
      updatedAt: item[fieldMapping.updatedAt]
    };
    return rec;
  });
};
