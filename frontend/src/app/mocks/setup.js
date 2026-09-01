import { appConfig } from '../config/env';
import { configureApiAdapter } from '../../shared/api/api';
import { mockApiAdapter as enrollmentMockApiAdapter } from '../../modules/enrollment/mocks/mockApi';

if (appConfig.useMockApi) configureApiAdapter(enrollmentMockApiAdapter);
