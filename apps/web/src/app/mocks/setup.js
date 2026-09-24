import { couponMockApiAdapter } from '../../modules/coupon/mocks/mockApi';
import { appConfig } from '../config/env';
import { configureApiAdapter } from '../../shared/api/api';
import { catalogMockApiAdapter } from '../../features/catalog/mocks/mockApi';

if (appConfig.useMockApi) {
  configureApiAdapter(async (config) => (
    await couponMockApiAdapter(config)
    || await catalogMockApiAdapter(config)
  ));
}
