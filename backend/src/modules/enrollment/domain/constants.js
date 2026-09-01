'use strict';

const STAGES = Object.freeze(['kindergarten', 'primary', 'middle']);
const CATEGORIES = Object.freeze(['urban', 'non_urban', 'private']);
const APPLICATION_STATUSES = Object.freeze([
  'draft',
  'reviewing',
  'returned',
  'initial_approved',
  'initial_rejected',
  'admitted',
]);
const ACTIVE_APPLICATION_STATUSES = Object.freeze([
  'draft',
  'reviewing',
  'returned',
  'initial_approved',
  'admitted',
]);
const PUBLICATION_TYPES = Object.freeze(['initial', 'final']);
const VERIFICATION_TYPES = Object.freeze([
  'household',
  'property',
  'social_security',
  'business_license',
  'parents_no_property',
]);

const STATUS_LABELS = Object.freeze({
  draft: '待提交',
  reviewing: '审核中',
  returned: '退回修改',
  initial_approved: '初审通过',
  initial_rejected: '初审不通过',
  admitted: '已录取',
});

module.exports = {
  STAGES,
  CATEGORIES,
  APPLICATION_STATUSES,
  ACTIVE_APPLICATION_STATUSES,
  PUBLICATION_TYPES,
  VERIFICATION_TYPES,
  STATUS_LABELS,
};
