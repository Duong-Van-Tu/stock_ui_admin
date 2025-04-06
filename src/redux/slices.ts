import { appSlice } from './slices/app.slice';
import { authSlice } from './slices/auth.slice';
import { earningsSlice } from './slices/earnings.slice';
import { searchSlice } from './slices/search';
import { SentimentSlice } from './slices/sentiment.slice';
import { signalSlice } from './slices/signals.slice';
import { stockScoreSlice } from './slices/stock-score.slice';

export const slices = [
  appSlice,
  authSlice,
  searchSlice,
  stockScoreSlice,
  signalSlice,
  earningsSlice,
  SentimentSlice
];
