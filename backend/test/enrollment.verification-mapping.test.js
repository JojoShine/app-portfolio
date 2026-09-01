const test = require('node:test');
const assert = require('node:assert/strict');
const { synchronizeVerificationData } = require('../src/modules/enrollment/domain/verification-mapping');

test('verified values copied unchanged are not marked as manually modified', () => {
  const originalData = { householdHead: { name: '李伟', address: '文教路18号' } };
  const result = synchronizeVerificationData({
    type: 'household',
    originalData,
    declaredData: originalData,
    payload: { family: { householdHeadName: '李伟', householdAddress: '文教路18号' } },
    patch: { family: { householdHeadName: '李伟', householdAddress: '文教路18号' } },
  });

  assert.equal(result.manuallyModified, false);
  assert.deepEqual(result.changedFields, []);
});

test('changed returned values update declared data and retain critical metadata', () => {
  const originalData = { records: [{ owner: '李伟', buildingArea: 88 }] };
  const result = synchronizeVerificationData({
    type: 'property',
    originalData,
    declaredData: originalData,
    payload: { property: { ownerName: '王芳', area: 90 } },
    patch: { property: { ownerName: '王芳', area: 90 } },
  });

  assert.equal(result.manuallyModified, true);
  assert.equal(result.nextDeclaredData.records[0].owner, '王芳');
  assert.equal(result.nextDeclaredData.records[0].buildingArea, 90);
  assert.deepEqual(result.changedFields.map((field) => field.critical), [true, false]);
});

test('manual filling for fields not returned by the department is not mislabeled', () => {
  const originalData = { records: [{ owner: '李伟', ownerDocument: null }] };
  const result = synchronizeVerificationData({
    type: 'property',
    originalData,
    declaredData: originalData,
    payload: { property: { ownerDocument: '320700000000000000' } },
    patch: { property: { ownerDocument: '320700000000000000' } },
  });

  assert.equal(result.manuallyModified, false);
  assert.deepEqual(result.changedFields, []);
});
