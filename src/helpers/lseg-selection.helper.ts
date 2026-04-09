export const transformLsegSelection = (data: any[]): LsegSelection[] => {
  if (data.length <= 0) return [];

  return data.map((item) => ({
    key: String(item.id),
    id: item.id,
    ric: item.ric,
    symbol: item.symbol,
    company: item.company,
    sector: item.sector,
    industry: item.industry,
    marketCapSelection: item.market_cap,
    avgVol: item.avg_vol,
    starEq: item.star_eq,
    starCombinedAlpha: item.star_combined_alpha,
    starPriceMomentum: item.star_price_momentum,
    starValueMomentum: item.star_value_momentum,
    starArmGlobal: item.star_arm_global,
    starArmSector: item.star_arm_sector,
    starArmRegion: item.star_arm_region,
    starPredictedSurpriseEps: item.star_predicted_surprise_eps,
    starNumbAnalystRevUp: item.star_numb_analyst_rev_up,
    starNumbAnalystRevDown: item.star_numb_analyst_rev_down,
    starRecommendation: item.star_recommondtion,
    starRsi14: item.star_rsi_14,
    starBeta: item.star_beta,
    starNumbAnalyst: item.star_numb_analyst,
    starEpsSmartEstimate: item.star_eps_smartestimate,
    starEpsMean: item.star_eps_mean,
    marketPsychPriceUp: item.market_psych_price_up,
    marketPsychPriceMomentum: item.market_psych_price_momentum,
    marketPsychOptimism: item.market_psych_optimism,
    marketPsychMarketRisk: item.market_psych_market_risk,
    news1dScore: item.news_1d_score,
    news3dScore: item.news_3d_score,
    newsNegativeArticleLast12h: item.news_negative_article_last_12h,
    starUpdateOn: item.star_updateon,
    marketPsychUpdateOn: item.market_psych_updateon,
    newsUpdateOn: item.news_updateon,
    isTop: item.is_top,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

export const convertLsegSortOrder = (type?: SortOrder) => {
  if (type === 'ascend') return 'ASC';
  if (type === 'descend') return 'DESC';
  return undefined;
};

export const formatStarValue = (
  value: number | string | null | undefined
) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'number') return Math.round(value * 100) / 100;
  return value;
};

export const getAvailableStarCount = (record: LsegSelection) => {
  const starValues = [
    record.starEq,
    record.starCombinedAlpha,
    record.starPriceMomentum,
    record.starValueMomentum,
    record.starArmGlobal,
    record.starArmSector,
    record.starArmRegion,
    record.starPredictedSurpriseEps,
    record.starNumbAnalystRevUp,
    record.starNumbAnalystRevDown,
    record.starRecommendation,
    record.starRsi14,
    record.starBeta,
    record.starNumbAnalyst,
    record.starEpsSmartEstimate,
    record.starEpsMean
  ];

  return starValues.filter(
    (value) => value !== null && value !== undefined && value !== ''
  ).length;
};
