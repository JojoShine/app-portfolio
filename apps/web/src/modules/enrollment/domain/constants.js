
const EMPTY_DRAFT = {
  student: {
    name: '',
    documentType: '居民身份证',
    documentNumber: '',
    householdLocation: '',
    residenceAddress: '',
    previousSchool: '',
    studentRecordNumber: '',
    photoName: '',
    modifiedReason: '',
    _departmentFields: ['name', 'documentType', 'documentNumber', 'householdLocation', 'residenceAddress'],
  },
  family: {
    modifiedReason: '',
    guardianIsHouseholdHead: false,
    guardianName: '',
    guardianRelation: '母亲',
    guardianDocument: '',
    guardianPhone: '',
    fatherName: '',
    fatherDocument: '',
    fatherPhone: '',
    fatherMissingReason: '信息完整',
    motherName: '',
    motherDocument: '',
    motherPhone: '',
    motherMissingReason: '信息完整',
    otherGuardianEnabled: false,
    otherGuardianName: '',
    otherGuardianRelation: '其他法定监护人',
    otherGuardianDocument: '',
    otherGuardianPhone: '',
    householdHeadName: '',
    householdHeadDocument: '',
    householdHeadPhone: '',
    householdHeadRelation: '父亲',
    householdAddress: '',
    _departmentFields: ['guardianName', 'guardianRelation', 'guardianDocument', 'householdHeadName', 'householdHeadDocument', 'householdAddress'],
  },
  property: {
    modifiedReason: '',
    hasProperty: true,
    propertyMode: 'family',
    selectedPropertyId: '',
    records: [],
    ownerName: '',
    ownerDocument: '',
    relation: '',
    certificateNumber: '',
    address: '',
    usage: '住宅',
    area: '',
    residenceAddress: '',
    _departmentFields: ['ownerName', 'ownerDocument', 'relation'],
  },
  materials: {
    modifiedReason: '',
    householdBook: true,
    propertyProof: false,
    guardianId: true,
    studentPhoto: true,
    studentRegistrationProof: false,
    socialSecurity: false,
    businessLicense: false,
    parentNoProperty: false,
    socialEnabled: false,
    socialPerson: '父亲',
    socialDocument: '',
    socialRegion: '',
    socialStatus: '',
    socialFirstDate: '',
    socialMonths: '',
    businessEnabled: false,
    businessOwnerRelation: '父亲',
    businessCreditCode: '',
    businessName: '',
    businessOperator: '',
    businessType: '',
    businessAddress: '',
    businessEstablishedDate: '',
    businessStatus: '',
    noPropertyEnabled: false,
    noPropertyRegion: '',
    fatherNoPropertyResult: '未查到结果',
    motherNoPropertyResult: '未查到结果',
    note: '',
    _departmentFields: ['socialDocument', 'socialRegion', 'socialStatus', 'socialFirstDate', 'socialMonths', 'businessCreditCode', 'businessName', 'businessOperator', 'businessType', 'businessAddress', 'businessEstablishedDate', 'businessStatus', 'noPropertyRegion', 'fatherNoPropertyResult', 'motherNoPropertyResult'],
  },
};

const clearPersonalValues = (value) => {
  if (Array.isArray(value)) return [];
  if (!value || typeof value !== 'object') {
    if (typeof value === 'boolean') return false;
    return '';
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clearPersonalValues(item)]));
};

export const createEmptyDraft = () => ({
  ...clearPersonalValues(EMPTY_DRAFT),
  student: { ...clearPersonalValues(EMPTY_DRAFT.student), documentType: '居民身份证' },
  family: {
    ...clearPersonalValues(EMPTY_DRAFT.family),
    guardianRelation: '母亲',
    guardianIsHouseholdHead: false,
    fatherMissingReason: '信息完整',
    motherMissingReason: '信息完整',
    otherGuardianRelation: '其他法定监护人',
    householdHeadRelation: '父亲',
  },
  property: { ...clearPersonalValues(EMPTY_DRAFT.property), hasProperty: true, propertyMode: 'family', usage: '住宅', records: [] },
  materials: {
    ...clearPersonalValues(EMPTY_DRAFT.materials),
    socialPerson: '父亲',
    businessOwnerRelation: '父亲',
    fatherNoPropertyResult: '未查到结果',
    motherNoPropertyResult: '未查到结果',
  },
});

export const DEFAULT_FLOW = {
  stageId: 'primary',
  categoryId: 'urban',
  schoolId: '',
  policyAccepted: false,
  dataAuthorized: false,
  preprocessed: false,
};

export const getStage = (id) => STAGES.find((item) => item.id === id) || STAGES[1];
export const getCategory = (id) => CATEGORIES.find((item) => item.id === id) || CATEGORIES[0];

export const STAGES = [
  { id: 'kindergarten', name: '幼儿园入学报名', shortName: '幼儿园入学', description: '适龄幼儿入园报名' },
  { id: 'primary', name: '幼升小报名', shortName: '幼升小', description: '小学一年级入学报名' },
  { id: 'middle', name: '小升初报名', shortName: '小升初', description: '初中一年级入学报名' },
];

export const CATEGORIES = [
  { id: 'urban', name: '城区', description: '城区公办学校报名', tone: 'blue' },
  { id: 'non_urban', name: '非城区', description: '乡镇及其他非城区公办学校报名', tone: 'green' },
  { id: 'private', name: '民办', description: '民办学校报名', tone: 'orange' },
];
