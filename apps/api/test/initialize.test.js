const test=require('node:test');
const assert=require('node:assert/strict');
const {initialize}=require('../scripts/initialize');
test('初始化先生成客户端、等待数据库，再部署迁移和指定模块数据',async()=>{
  const calls=[];
  await initialize({names:['quiz'],run:async(file,args)=>calls.push(args.slice(1)),waitForDatabase:async()=>calls.push(['ready'])});
  assert.deepEqual(calls,[['generate'],['ready'],['migrate','deploy'],['quiz']]);
});
test('迁移失败不继续写入种子数据，未知模块不运行任何命令',async()=>{
  const calls=[];
  const run=async(file,args)=>{calls.push(args.slice(1));if(args.includes('migrate'))throw new Error('migration failed');};
  await assert.rejects(initialize({names:['library'],run,waitForDatabase:async()=>{}}),/migration failed/);
  assert.deepEqual(calls,[['generate'],['migrate','deploy']]);
  await assert.rejects(initialize({names:['unknown'],run,waitForDatabase:async()=>{}}),/未知 seed/);
  assert.equal(calls.length,2);
});
