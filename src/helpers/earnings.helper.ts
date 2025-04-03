export const transformEarningsSummary = (
  earningsSummary: any[]
): EarningsSummary[] => {
  return earningsSummary.map((earning) => ({
    date: earning.date,
    total: earning.total ? Number(earning.total) : 0
  }));
};
