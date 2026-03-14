import { ENV_CONSTANTS } from '../constants/env.constants';
import { ApiFetcher } from './api-fetcher.service';

export const apiService = new ApiFetcher(ENV_CONSTANTS.apiUrl);
