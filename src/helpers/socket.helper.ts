export const getCurrentPrice = (
  resFromWS: { realtime: { symbol: string; close: number }[] },
  symbol: string
) => {
  return resFromWS.realtime.find((r) => r.symbol === symbol)?.close ?? null;
};
