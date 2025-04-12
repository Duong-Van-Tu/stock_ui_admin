type ListHighActivityFilter = Filter & {
  lastHours?: number;
  group?: string;
  sentiment?: string;
  impact?: string;
  fromDate?: string;
  toDate?: string;
};

type ListHighActivity = {
  key: string;
  symbol: string;
  groupStock: string;
  publishingTime: string;
  headline: string;
  source: string;
  sentiment: string;
  impact: string;
  url: string;
  beta: number;
  avgVolume: number;
  atr: number;
  atrPercent: number;
  fundamentalScore: number;
  sentimentScore: number;
  earningsScore: number;
  weekLow52: number;
  weekHigh52: number;
  marketCapListWatcher: string;
  industry: string;
  sector: string;
  subIndustry: string;
  dateTime: number;
  earningDate: string | null;
  totalScore: number;
};
