const OSS = require('ali-oss');
const env = require('./env');
const {ApiError, NotFoundError, ServiceUnavailableError} = require('../common/utils/error');

// 数据库只保存 objectKey；更换应用服务器不改变对象地址或文件权限。
function createOssStorage(settings, factory = options => new OSS(options)) {
  let client;
  let ready;
  function getClient() {
    if (!settings.FILE_STORAGE_ENABLED) throw new ServiceUnavailableError('文件存储未启用');
    if (!client) client = factory({
      region: settings.OSS_REGION,
      bucket: settings.OSS_BUCKET,
      endpoint: settings.OSS_ENDPOINT || undefined,
      accessKeyId: settings.OSS_ACCESS_KEY_ID,
      accessKeySecret: settings.OSS_ACCESS_KEY_SECRET,
      stsToken: settings.OSS_STS_TOKEN || undefined,
      secure: true,
      timeout: 60000,
    });
    return client;
  }
  function storageError(error) {
    if (error instanceof ApiError) return error;
    if (error.code === 'NoSuchKey') return new NotFoundError('文件不存在');
    return new ServiceUnavailableError('对象存储暂不可用，请稍后重试');
  }
  async function ensurePrivateBucket() {
    try {
      const sdk = getClient();
      ready ||= sdk.getBucketACL(settings.OSS_BUCKET).then(result => {
        if (result.acl !== 'private') throw new ServiceUnavailableError('OSS 存储桶必须设置为私有');
      }).catch(error => { ready = null; throw error; });
      await ready;
    } catch (error) { throw storageError(error); }
  }
  async function putObject(key, data, mimeType) {
    try {
      await ensurePrivateBucket();
      await getClient().put(key, data, {mime: mimeType, headers: {'x-oss-object-acl': 'private'}});
    } catch (error) { throw storageError(error); }
  }
  async function getObject(key) {
    try {
      await ensurePrivateBucket();
      return (await getClient().getStream(key)).stream;
    } catch (error) { throw storageError(error); }
  }
  async function deleteObject(key) {
    try { await ensurePrivateBucket(); await getClient().delete(key); }
    catch (error) { throw storageError(error); }
  }
  async function putFileIfMissing(key, sourcePath, mimeType) {
    try {
      await ensurePrivateBucket();
      try { await getClient().head(key); return false; }
      catch (error) { if (error.code !== 'NoSuchKey') throw error; }
      try {
        await getClient().put(key, sourcePath, {
          mime: mimeType,
          headers: {'x-oss-object-acl': 'private', 'x-oss-forbid-overwrite': 'true'},
        });
      } catch (error) {
        if (error.code === 'FileAlreadyExists') return false;
        throw error;
      }
      return true;
    } catch (error) { throw storageError(error); }
  }
  return {ensurePrivateBucket, putObject, getObject, deleteObject, putFileIfMissing};
}
module.exports = {...createOssStorage(env), createOssStorage};
