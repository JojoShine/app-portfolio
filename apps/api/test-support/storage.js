const {Readable}=require('node:stream');
const storage=require('../src/config/oss');
const {NotFoundError}=require('../src/common/utils/error');
// 仅隔离云存储网络；上传处理、数据库、鉴权与业务接口仍执行真实代码。
module.exports = t => {
  const objects=new Map();
  t.mock.method(storage,'ensurePrivateBucket',async()=>{});
  t.mock.method(storage,'putObject',async(key,buffer)=>{objects.set(key,Buffer.from(buffer));});
  t.mock.method(storage,'getObject',async key=>{
    if(!objects.has(key))throw new NotFoundError('文件不存在');
    return Readable.from(objects.get(key));
  });
  t.mock.method(storage,'deleteObject',async key=>{objects.delete(key);});
  return { uploadFile: async ({objectKey,sourcePath}) => {
    objects.set(objectKey, await require('node:fs/promises').readFile(sourcePath));
  } };
};
