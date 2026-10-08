const path=require('node:path');
const {spawn}=require('node:child_process');
const {selectModules}=require('../prisma/seed');
const cwd=path.resolve(__dirname,'..');

function runCommand(file,args){
  return new Promise((resolve,reject)=>{
    const child=spawn(file,args,{cwd,env:process.env,stdio:'inherit'});
    child.once('error',reject);
    child.once('exit',(code,signal)=>code===0?resolve():reject(new Error('初始化命令失败：'+(signal||code))));
  });
}
async function waitForDatabase(){
  const db=require('../src/config/database');
  try{
    for(let attempt=0;attempt<30;attempt++){
      try{await db.$queryRaw`SELECT 1`;return;}
      catch(error){
        if(attempt===29)throw new Error('数据库未就绪，已停止初始化',{cause:error});
        await new Promise(resolve=>setTimeout(resolve,2000));
      }
    }
  }finally{await db.$disconnect();}
}
async function initialize({names=[],run=runCommand,waitForDatabase:wait=waitForDatabase}={}){
  const selected=selectModules(names);
  const prisma=require.resolve('prisma/build/index.js');
  await run(process.execPath,[prisma,'generate']);
  await wait();
  // Prisma 使用同一份迁移账本；结构按模块拆分，但始终顺序部署全部待应用迁移。
  await run(process.execPath,[prisma,'migrate','deploy']);
  await run(process.execPath,[path.join(cwd,'prisma/seed.js'),...selected]);
}
if(require.main===module){
  const env=require('../src/config/env');
  Promise.resolve().then(()=>{
    env.validate();
    if(!env.DATABASE_URL)throw new Error('初始化需要 DATABASE_URL');
    const names=process.argv.slice(2);
    return initialize({names:names.length?names:(process.env.SEED_MODULES||'').split(/[\s,]+/).filter(Boolean)});
  }).catch(error=>{console.error(error.message);process.exitCode=1;});
}
module.exports={initialize};
