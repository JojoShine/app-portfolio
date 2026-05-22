import * as institutionService from './institutionService';
import * as productService from './productService';
import * as policyService from './policyService';
import * as applicationService from './applicationService';

/**
 * 海融惠企模块业务 Service 层
 * 统一导出所有service
 */

export default {
  ...institutionService.default,
  ...productService.default,
  ...policyService.default,
  ...applicationService.default,
};