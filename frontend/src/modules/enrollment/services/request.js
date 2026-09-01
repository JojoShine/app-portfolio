import { unwrap } from '../../../shared/api/api';

export const request = async (executor) => unwrap(await executor());
