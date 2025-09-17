import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';

export const transformOptionChangesData = (rows: any[]): OptionChange[] => {
  if (!rows) return [];

  return rows.map((item) => ({
    key: uuid(),
    id: item.id,
    symbol: item.symbol,
    price: item.price,
    strike: item.strike,
    dte: item.dte,
    lastOptionPrice: item[fieldMapping.lastOptionPrice] ?? '',
    expDate: item[fieldMapping.expDate] ?? '',
    optionType: item[fieldMapping.optionType] ?? '',
    messageType: item[fieldMapping.messageType] ?? '',
    ask: item[fieldMapping.ask],
    change: item[fieldMapping.change],
    changePercent: item[fieldMapping.changePercent],
    delta: item[fieldMapping.delta],
    theta: item[fieldMapping.theta],
    vega: item[fieldMapping.vega],
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
    bidAsk: item[fieldMapping.bidAsk]
  }));
};
