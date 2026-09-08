import { appConfig } from '../config/env';
import { configureApiAdapter } from '../../shared/api/api';
import { catalogMockApiAdapter } from '../../features/catalog/mocks/mockApi';
import { mockApiAdapter as enrollmentMockApiAdapter } from '../../modules/enrollment/mocks/mockApi';

if (appConfig.useMockApi) {
  configureApiAdapter(async (config) => (
    await catalogMockApiAdapter(config)
    || await enrollmentMockApiAdapter(config)
  ));
}
