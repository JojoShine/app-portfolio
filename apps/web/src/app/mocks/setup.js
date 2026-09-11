import { quizMockApiAdapter } from '../../modules/quiz/mocks/mockApi';
import { greenPointsMockApiAdapter } from '../../modules/green-points/mocks/mockApi';
import { couponMockApiAdapter } from '../../modules/coupon/mocks/mockApi';
import { appConfig } from '../config/env';
import { configureApiAdapter } from '../../shared/api/api';
import { catalogMockApiAdapter } from '../../features/catalog/mocks/mockApi';
import { mockApiAdapter as enrollmentMockApiAdapter } from '../../modules/enrollment/mocks/mockApi';

if (appConfig.useMockApi) {
  configureApiAdapter(async (config) => (
    await quizMockApiAdapter(config)
    || await greenPointsMockApiAdapter(config)
    || await couponMockApiAdapter(config)
    || await catalogMockApiAdapter(config)
    || await enrollmentMockApiAdapter(config)
  ));
}
