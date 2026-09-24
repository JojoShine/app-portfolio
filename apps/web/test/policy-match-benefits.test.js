import test from 'node:test';
import assert from 'node:assert/strict';
import {benefitLabel,applicationPath,eligibility} from '../src/modules/policy-match/utils/format.js';

test('重复享受状态不把条件符合或缺少记录表述为可以领取',()=>{
  assert.equal(eligibility.eligible,'条件符合');
  assert.equal(benefitLabel(), '重复享受需核实');
  assert.equal(benefitLabel({blocked:true}),'互斥申报受限');
  assert.equal(benefitLabel({existing:{id:'a'},blocked:true}),'已有办理记录');
  assert.equal(benefitLabel({stacking:'difference'}),'仅补差额，需核实');
});
test('已有记录按实际状态继续办理或查看，不重新填写申请',()=>{
  assert.equal(applicationPath({id:'a',status:'draft',channel:'internal'}),'/policy-match/apply/a');
  assert.equal(applicationPath({id:'a',status:'submitted',channel:'internal'}),'/policy-match/records/a');
  assert.equal(applicationPath({id:'a',status:'approved',channel:'internal'}),'/policy-match/records/a');
  assert.equal(applicationPath({id:'a',status:'preparing',channel:'external'}),'/policy-match/external/a');
});
