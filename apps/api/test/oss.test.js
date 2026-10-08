const test=require('node:test');
const assert=require('node:assert/strict');
const {Readable}=require('node:stream');
const {createOssStorage}=require('../src/config/oss');
const settings={FILE_STORAGE_ENABLED:true,OSS_BUCKET:'test-bucket'};
test('OSS 上传和读取保持对象键不变，强制私有且不返回公有地址',async()=>{
  const data=Buffer.from('file');
  const calls=[];
  const store=createOssStorage(settings,()=>({
    getBucketACL:async bucket=>{assert.equal(bucket,'test-bucket');return {acl:'private'};},
    put:async(...args)=>calls.push(args),
    getStream:async key=>{assert.equal(key,'image/a.png');return {stream:Readable.from(data)};},
  }));
  await store.putObject('image/a.png',data,'image/png');
  assert.deepEqual(calls,[['image/a.png',data,{mime:'image/png',headers:{'x-oss-object-acl':'private'}}]]);
  const chunks=[];for await(const chunk of await store.getObject('image/a.png'))chunks.push(chunk);
  assert.deepEqual(Buffer.concat(chunks),data);
});
test('重复初始化不覆盖 OSS 已存在文件，权限错误不得视为文件缺失',async()=>{
  let puts=0;
  const store=createOssStorage(settings,()=>({getBucketACL:async()=>({acl:'private'}),head:async()=>({}),put:async()=>{puts++;}}));
  assert.equal(await store.putFileIfMissing('quiz/a.png','/unused','image/png'),false);
  assert.equal(puts,0);
  const denied=createOssStorage(settings,()=>({getBucketACL:async()=>({acl:'private'}),head:async()=>{throw Object.assign(new Error('secret'),{code:'AccessDenied',status:403});}}));
  await assert.rejects(denied.putFileIfMissing('a','/unused','image/png'),error=>error.code===1007&&!error.message.includes('secret'));
});
test('只在 NoSuchKey 时补资源，并发初始化冲突视为已存在',async()=>{
  const calls=[];
  const store=createOssStorage(settings,()=>({
    getBucketACL:async()=>({acl:'private'}),
    head:async()=>{throw Object.assign(new Error('missing'),{code:'NoSuchKey',status:404});},
    put:async(...args)=>{calls.push(args);throw Object.assign(new Error('exists'),{code:'FileAlreadyExists',status:409});},
  }));
  assert.equal(await store.putFileIfMissing('library/a.png','/image.png','image/png'),false);
  assert.equal(calls[0][0],'library/a.png');
  assert.equal(calls[0][2].headers['x-oss-forbid-overwrite'],'true');
});
test('公共桶和关闭的存储拒绝读写，缺失对象使用标准404',async()=>{
  const publicStore=createOssStorage(settings,()=>({getBucketACL:async()=>({acl:'public-read'})}));
  await assert.rejects(publicStore.ensurePrivateBucket(),error=>error.code===1007);
  const disabled=createOssStorage({...settings,FILE_STORAGE_ENABLED:false},()=>{throw new Error('不应访问网络');});
  await assert.rejects(disabled.ensurePrivateBucket(),error=>error.code===1007);
  const missing=createOssStorage(settings,()=>({getBucketACL:async()=>({acl:'private'}),getStream:async()=>{throw Object.assign(new Error('missing'),{code:'NoSuchKey'});}}));
  await assert.rejects(missing.getObject('missing'),error=>error.statusCode===404&&error.code===1002);
});
