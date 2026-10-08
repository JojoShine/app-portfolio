const test=require('node:test');
const assert=require('node:assert/strict');
const {Prisma}=require('@prisma/client');
const multer=require('multer');
const errorHandler=require('../src/common/middleware/errorHandler');
function handle(error){
  const result={};
  const res={status(code){result.status=code;return this;},json(body){result.body=body;return this;}};
  errorHandler(error,{url:'/test',method:'POST',requestId:'test-id'},res,()=>{});
  return result;
}
test('Prisma 缺失记录与标准 NotFoundError 使用相同业务码',()=>{
  const result=handle(new Prisma.PrismaClientKnownRequestError('missing',{code:'P2025',clientVersion:'6'}));
  assert.equal(result.status,404);
  assert.equal(result.body.code,1002);
  assert.equal(result.body.data,null);
  assert.equal(result.body.requestId,'test-id');
});
test('上传限制和过大请求是统一校验错误而非服务器故障',()=>{
  for(const error of [new multer.MulterError('LIMIT_FILE_SIZE'),Object.assign(new Error('large'),{type:'entity.too.large',status:413})]){
    const result=handle(error);
    assert.equal(result.status,413);
    assert.equal(result.body.code,1001);
    assert.equal(result.body.data,null);
  }
});
test('已经发送文件流响应时将异常交回 Express，不重复发送 JSON',()=>{
  let forwarded;
  errorHandler(new Error('stream broken'),{url:'/file',method:'GET'},{headersSent:true},error=>{forwarded=error;});
  assert.equal(forwarded.message,'stream broken');
});

test('真实 HTTP 的健康检查、404 与 JSON 解析错误保持标准结构',async()=>{
  const server=require('../src/app').listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try {
    const healthy=await (await fetch(`${base}/health`)).json();
    assert.equal(healthy.code,0);
    assert.equal(healthy.data.status,'ok');
    for(const [path,options,status,code] of [
      ['/missing',{},404,1002],
      ['/api/auth/me',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'},400,1001],
    ]) {
      const res=await fetch(base+path,options);
      const body=await res.json();
      assert.equal(res.status,status);
      assert.equal(body.code,code);
      assert.equal(body.data,null);
      assert.ok(body.requestId);
    }
  } finally { server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
});

test('文件流读取失败会拒绝，供统一异常中间件处理',async()=>{
  const {Readable,PassThrough}=require('node:stream');
  const source=new Readable({read(){this.destroy(new Error('read failed'));}});
  const target=new PassThrough();
  await assert.rejects(require('../src/common/utils/pipeFile')(source,target),/read failed/);
  target.destroy();
});
