import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState, dispatch } from './engine.js';
const now = Date.parse('2026-09-09T06:00:00Z');
test('exchange retries charge only once; cancellation refunds only once', () => {
 const s=createState(now); const b=s.balance;
 const order=dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'a'},now);
 assert.equal(s.balance,b-1280);
 assert.equal(dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'a'},now).id,order.id);
 dispatch(s,'cancel',{id:order.id},now); dispatch(s,'cancel',{id:order.id},now);
 assert.equal(s.balance,b); assert.equal(s.products.find(p=>p.id==='cup').stock,36);
});
test('expired physical refunds once; expired virtual never refunds',()=>{
 const s=createState(now);const b=s.balance;
 dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'a'},now);
 dispatch(s,'redeem',{productId:'ticket',quantity:1,requestId:'b'},now);
 dispatch(s,'read',{},now+31*86400000);dispatch(s,'read',{},now+32*86400000);
 assert.equal(s.balance,b-800);assert.ok(s.orders.every(o=>o.status==='expired'));
});
test('seventh day bonus and daily idempotency',()=>{
 const s=createState(now);s.checkIns=[];const b=s.balance;
 for(let i=0;i<7;i++)dispatch(s,'check-in',{},now+i*86400000);
 assert.equal(s.balance,b+135);
 assert.throws(()=>dispatch(s,'check-in',{},now+6*86400000),/已签到/);
});
test('invalid quantities and insufficient points leave state untouched',()=>{
 const s=createState(now);s.balance=10;
 for(const quantity of [0,-1,1.5,100]) assert.throws(()=>dispatch(s,'redeem',{productId:'cup',quantity,requestId:String(quantity)},now));
 assert.equal(s.balance,10);assert.equal(s.orders.length,0);
 assert.throws(()=>dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'low'},now),/积分不足/);
});
test('virtual issuance cannot cancel, completed credentials cannot be reused',()=>{
 const s=createState(now);const o=dispatch(s,'redeem',{productId:'ticket',quantity:1,requestId:'v'},now);
 assert.throws(()=>dispatch(s,'cancel',{id:o.id},now),/不可取消/);
 dispatch(s,'complete',{id:o.id},now);assert.throws(()=>dispatch(s,'complete',{id:o.id},now),/不可使用/);
});
test('virtual expiration does not restore issuance allowance',()=>{
 const s=createState(now);s.balance=10000;
 dispatch(s,'redeem',{productId:'ticket',quantity:2,requestId:'v'},now);
 dispatch(s,'read',{},now+31*86400000);
 assert.throws(()=>dispatch(s,'redeem',{productId:'ticket',quantity:1,requestId:'v2'},now+31*86400000),/限兑/);
});
test('missed day resets streak and Shanghai midnight defines sign-in date',()=>{
 const s=createState(now);s.checkIns=[];
 dispatch(s,'check-in',{},Date.parse('2026-09-09T15:59:00Z'));
 dispatch(s,'check-in',{},Date.parse('2026-09-09T16:01:00Z'));
 assert.deepEqual(s.checkIns,['2026-09-09','2026-09-10']);
 const before=s.balance;
 assert.equal(dispatch(s,'check-in',{},now+5*86400000).amount,15);
 assert.equal(s.balance,before+15);
});
test('activity boundary refuses redemption without altering points',()=>{
 const s=createState(now);const b=s.balance;
 assert.throws(()=>dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'closed'},now+7*86400000),/活动/);
 assert.equal(s.balance,b);
});
test('coupon reduces charge once, cancellation restores coupon and actual points',()=>{
 const s=createState(now); const b=s.balance;
 dispatch(s,'claim-coupon',{id:'welcome'},now);
 const o=dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'coupon',couponId:'welcome'},now);
 assert.equal(o.total,1180);assert.equal(s.balance,b-1180);
 assert.throws(()=>dispatch(s,'redeem',{productId:'book',quantity:1,requestId:'again',couponId:'welcome'},now),/抵扣券/);
 dispatch(s,'cancel',{id:o.id},now);assert.equal(s.balance,b);
 assert.equal(s.wallet.find(c=>c.id==='welcome').usedBy,null);
});
test('invalid coupon and invalid delivery address never deduct points',()=>{
 const s=createState(now);const b=s.balance;
 assert.throws(()=>dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'bad',couponId:'missing'},now),/抵扣券/);
 assert.throws(()=>dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'address',delivery:'shipping',addressId:'missing'},now),/地址/);
 assert.equal(s.balance,b);assert.equal(s.orders.length,0);
});
test('favorites, browsing history and addresses persist without duplicate records',()=>{
 const s=createState(now);
 dispatch(s,'favorite',{id:'cup'},now);assert.ok(s.favorites.includes('cup'));
 dispatch(s,'favorite',{id:'cup'},now);assert.ok(!s.favorites.includes('cup'));
 dispatch(s,'view',{id:'cup'},now);dispatch(s,'view',{id:'cup'},now);assert.equal(s.history.length,1);
 assert.throws(()=>dispatch(s,'save-address',{name:'张三',phone:'123',detail:'青禾路28号'},now),/手机号/);
 const a=dispatch(s,'save-address',{name:'张三',phone:'13800138000',detail:'上海市青禾路28号',isDefault:true},now);
 const o=dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'ship',delivery:'shipping',addressId:a.id},now);
 assert.equal(o.delivery,'shipping');assert.equal(o.address.detail,a.detail);
 dispatch(s,'delete-address',{id:a.id},now);assert.equal(o.address.detail,a.detail);
});
test('support requests validate content and link to owned orders',()=>{
 const s=createState(now);
 assert.throws(()=>dispatch(s,'support',{message:'短'},now),/至少/);
 dispatch(s,'support',{message:'兑换码无法使用，请协助处理',kind:'权益使用'},now);
 assert.equal(s.support.length,1);assert.equal(s.support[0].status,'待处理');
});
test('shipping completion and expiry keep inventory and refunds consistent',()=>{
 const s=createState(now);const b=s.balance;
 const a=dispatch(s,'save-address',{name:'测试收件人',phone:'13800138000',detail:'上海市测试区示例路28号'},now);
 const order=dispatch(s,'redeem',{productId:'cup',quantity:1,requestId:'delivery',delivery:'shipping',addressId:a.id},now);
 assert.equal(order.status,'shipping');
 dispatch(s,'read',{},now+8*86400000);assert.equal(order.status,'expired');assert.equal(s.balance,b);
 dispatch(s,'read',{},now+9*86400000);assert.equal(s.balance,b);
});
test('expired coupons and thresholds reject without consuming a coupon',()=>{
 const s=createState(now);dispatch(s,'claim-coupon',{id:'welcome'},now);
 assert.throws(()=>dispatch(s,'redeem',{productId:'coffee',quantity:1,requestId:'threshold',couponId:'welcome'},now),/抵扣券/);
 assert.throws(()=>dispatch(s,'redeem',{productId:'music',quantity:1,requestId:'expired',couponId:'welcome'},now+8*86400000),/抵扣券/);
 assert.equal(s.wallet[0].usedBy,null);assert.equal(s.orders.length,0);
});
test('legacy accounts gain new catalog and services without resetting orders or balance',async()=>{
 const { upgradeState }=await import('./engine.js');
 const s=createState(now);s.balance=375;s.products=s.products.slice(0,6);delete s.favorites;delete s.wallet;delete s.coupons;
 const prior=structuredClone(s.orders);upgradeState(s,now);
 assert.equal(s.balance,375);assert.deepEqual(s.orders,prior);assert.equal(s.products.length,16);assert.deepEqual(s.wallet,[]);
 upgradeState(s,now);assert.equal(s.products.length,16);
});
test('affordability includes an eligible owned coupon without assuming unclaimed offers',async()=>{
 const { redemptionIssue }=await import('../utils/rules.js');
 const s=createState(now);s.balance=1200;const p=s.products.find(p=>p.id==='cup');
 assert.equal(redemptionIssue(s,p,1,now),'可用积分不足');
 dispatch(s,'claim-coupon',{id:'welcome'},now);
 assert.equal(redemptionIssue(s,p,1,now),'');
});
