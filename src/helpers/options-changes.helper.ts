import { v4 as uuid } from 'uuid';
import { fieldMapping } from './field-mapping.helper';
import dayjs from 'dayjs';

type MN = number | null | undefined;

const clamp01 = (x: MN) =>
  Number.isFinite(x as number) ? Math.max(0, Math.min(1, x as number)) : 0;

const num = (x: any, d = 0) => (Number.isFinite(Number(x)) ? Number(x) : d);

function bePctCalc({
  price,
  strike,
  premium,
  optionType
}: {
  price: MN;
  strike: MN;
  premium: MN;
  optionType?: string;
}) {
  const p = num(price);
  const k = num(strike);
  const prem = num(premium);
  if (p <= 0) return 1;
  const isCall = (optionType || '').toUpperCase().startsWith('C');
  const be = isCall ? k + prem : k - prem;
  return Math.abs((isCall ? be - p : p - be) / p);
}

function resolveBePct(row: {
  beAskPercent?: MN;
  price?: MN;
  strike?: MN;
  lastOptionPrice?: MN;
  optionType?: string;
}) {
  const raw = row.beAskPercent;
  let bePct = Number.isFinite(Number(raw)) ? Number(raw) : NaN;
  if (Number.isFinite(bePct)) bePct = bePct > 1 ? bePct / 100 : bePct;
  if (Number.isFinite(bePct) && bePct >= 0) return bePct as number;
  return bePctCalc({
    price: row.price,
    strike: row.strike,
    premium: row.lastOptionPrice,
    optionType: row.optionType
  });
}

function spreadPctCalc({ bid, ask, bidAsk }: { bid: MN; ask: MN; bidAsk: MN }) {
  const a = num(ask, NaN);
  const b = num(bid, NaN);
  if (Number.isFinite(a) && Number.isFinite(b) && a > 0 && b >= 0) {
    const mid = (a + b) / 2;
    if (mid > 0) return Math.abs(a - b) / mid;
  }
  const s = num(bidAsk, NaN);
  if (Number.isFinite(s) && s >= 0) return s;
  return 1;
}

function computeScore(row: {
  delta?: MN;
  volume?: MN;
  openInt?: MN;
  ask?: MN;
  bid?: MN;
  bidAsk?: MN;
  theta?: MN;
  ivRank?: MN;
  price?: MN;
  strike?: MN;
  lastOptionPrice?: MN;
  optionType?: string;
  beAskPercent?: MN;
}) {
  const delta = num(row.delta, NaN);
  const deltaScore = Number.isFinite(delta)
    ? clamp01(1 - Math.abs(delta - 0.65) / 0.2)
    : 0;
  const liqScore =
    0.4 * clamp01(num(row.volume) / 5000) +
    0.6 * clamp01(num(row.openInt) / 20000);
  const spreadScore = clamp01(
    1 -
      clamp01(
        spreadPctCalc({
          bid: (row as any)['bid'],
          ask: row.ask,
          bidAsk: row.bidAsk
        }) / 0.08
      )
  );
  const bePct = resolveBePct({
    beAskPercent: row.beAskPercent,
    price: row.price,
    strike: row.strike,
    lastOptionPrice: row.lastOptionPrice,
    optionType: row.optionType
  });
  const beScore = clamp01(1 - clamp01(bePct / 0.08));
  const theta = num(row.theta, NaN);
  const thetaScore = Number.isFinite(theta)
    ? clamp01(1 - clamp01(Math.abs(theta) / 0.5))
    : 0;
  const ivRank = num(row.ivRank, NaN);
  const ivScore = Number.isFinite(ivRank)
    ? clamp01(1 - clamp01(ivRank / 50))
    : 0;
  const score =
    100 *
    (0.3 * deltaScore +
      0.25 * liqScore +
      0.15 * spreadScore +
      0.15 * beScore +
      0.1 * thetaScore +
      0.05 * ivScore);
  return Math.round(score * 100) / 100;
}

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
      updatedAt: item[fieldMapping.updatedAt]
    };
    const score = computeScore({
      delta: rec.delta,
      volume: rec.volume,
      openInt: rec.openInt,
      ask: rec.ask,
      bidAsk: rec.bidAsk,
      theta: rec.theta,
      ivRank: rec.ivRank,
      price: rec.price,
      strike: rec.strike,
      lastOptionPrice: rec.lastOptionPrice,
      optionType: rec.optionType,
      beAskPercent: rec.beAskPercent
    });
    return { ...rec, score };
  });
};
