'use strict';

const MAPPINGS = Object.freeze({
  household: [
    ['student.householdLocation', 'student.householdLocation', true],
    ['student.currentAddress', 'student.residenceAddress', true],
    ['guardian.name', 'family.guardianName', true],
    ['guardian.documentNumber', 'family.guardianDocument', true],
    ['guardian.phone', 'family.guardianPhone', false],
    ['guardian.relation', 'family.guardianRelation', true],
    ['householdHead.name', 'family.householdHeadName', true],
    ['householdHead.documentNumber', 'family.householdHeadDocument', true],
    ['householdHead.phone', 'family.householdHeadPhone', false],
    ['householdHead.relation', 'family.householdHeadRelation', true],
    ['householdHead.address', 'family.householdAddress', true],
  ],
  property: [
    ['records.0.owner', 'property.ownerName', true],
    ['records.0.ownerDocument', 'property.ownerDocument', true],
    ['records.0.relation', 'property.relation', true],
    ['records.0.certificateNumber', 'property.certificateNumber', true],
    ['records.0.address', 'property.address', true],
    ['records.0.usage', 'property.usage', true],
    ['records.0.buildingArea', 'property.area', false],
  ],
  social_security: [
    ['records.0.insuredPerson', 'materials.socialPerson', true],
    ['records.0.documentNumber', 'materials.socialDocument', true],
    ['records.0.region', 'materials.socialRegion', true],
    ['records.0.status', 'materials.socialStatus', true],
    ['records.0.firstInsuredAt', 'materials.socialFirstDate', true],
    ['records.0.continuousMonths', 'materials.socialMonths', true],
  ],
  business_license: [
    ['records.0.relation', 'materials.businessOwnerRelation', true],
    ['records.0.creditCode', 'materials.businessCreditCode', true],
    ['records.0.entityName', 'materials.businessName', true],
    ['records.0.operator', 'materials.businessOperator', true],
    ['records.0.type', 'materials.businessType', true],
    ['records.0.address', 'materials.businessAddress', true],
    ['records.0.establishedAt', 'materials.businessEstablishedDate', true],
    ['records.0.status', 'materials.businessStatus', true],
  ],
  parents_no_property: [
    ['father.name', 'materials.fatherNoPropertyName', true],
    ['father.documentNumber', 'materials.fatherNoPropertyDocument', true],
    ['father.region', 'materials.noPropertyRegion', true],
    ['father.result', 'materials.fatherNoPropertyResult', true],
    ['mother.name', 'materials.motherNoPropertyName', true],
    ['mother.documentNumber', 'materials.motherNoPropertyDocument', true],
    ['mother.result', 'materials.motherNoPropertyResult', true],
  ],
});

const pathParts = (path) => path.split('.');

const hasAtPath = (value, path) => {
  let current = value;
  for (const part of pathParts(path)) {
    if (current === null || current === undefined || !Object.prototype.hasOwnProperty.call(current, part)) return false;
    current = current[part];
  }
  return true;
};

const getAtPath = (value, path) => pathParts(path).reduce((current, part) => current?.[part], value);

const setAtPath = (value, path, nextValue) => {
  const parts = pathParts(path);
  let current = value;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      current[part] = nextValue;
      return;
    }
    const followingPart = parts[index + 1];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = /^\d+$/.test(followingPart) ? [] : {};
    }
    current = current[part];
  });
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const equals = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const wasReturned = (value) => value !== undefined && value !== null && value !== '';

const synchronizeVerificationData = ({ type, originalData, declaredData, payload, patch }) => {
  const mappings = MAPPINGS[type] || [];
  const nextDeclaredData = clone(declaredData ?? originalData ?? {});
  const changedFields = [];

  for (const [sourcePath, payloadPath, critical] of mappings) {
    if (!hasAtPath(patch, payloadPath)) continue;
    if (!hasAtPath(originalData, sourcePath)) continue;
    const originalValue = getAtPath(originalData, sourcePath);
    if (!wasReturned(originalValue)) continue;

    const nextValue = getAtPath(payload, payloadPath);
    const currentDeclaredValue = getAtPath(nextDeclaredData, sourcePath);
    if (equals(currentDeclaredValue, nextValue)) continue;
    setAtPath(nextDeclaredData, sourcePath, nextValue);
    changedFields.push({ sourcePath, payloadPath, critical });
  }

  return {
    nextDeclaredData,
    changedFields,
    manuallyModified: !equals(originalData, nextDeclaredData),
  };
};

module.exports = { MAPPINGS, synchronizeVerificationData };
