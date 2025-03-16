import { ApiFetcher } from '@/utils/api-service';
import { appEnvs } from './env-mapper';

export const defaultApiFetcher = new ApiFetcher(appEnvs.default.apiHost);
