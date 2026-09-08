import { create } from 'zustand';
import {
  DEFAULT_FLOW,
  createEmptyDraft,
  getCategory,
  getStage,
} from '../domain/constants';

if (typeof window !== 'undefined') {
  window.localStorage.removeItem('app-portfolio.enrollment');
}

const useEnrollmentStore = create((set, get) => ({
  flow: { ...DEFAULT_FLOW },
  selectedSchool: null,
  draft: createEmptyDraft(),
  originalDraft: createEmptyDraft(),
  application: null,
  serverApplicationId: null,
  serverVersion: 1,
  savedAt: '14:32',

  selectStage: (stageId) => set((state) => ({
    selectedSchool: null,
    flow: {
      ...state.flow,
      stageId,
      schoolId: '',
      policyAccepted: false,
      dataAuthorized: false,
      preprocessed: false,
    },
  })),

  selectCategory: (categoryId) => set((state) => ({
    selectedSchool: null,
    flow: {
      ...state.flow,
      categoryId,
      schoolId: '',
      policyAccepted: false,
    },
  })),

  selectSchool: (school) => set((state) => ({
    selectedSchool: typeof school === 'string' ? null : (school || null),
    flow: {
      ...state.flow,
      stageId: school?.stage || state.flow.stageId,
      categoryId: school?.categoryId || school?.category || state.flow.categoryId,
      schoolId: typeof school === 'string' ? school : (school?.id || ''),
      policyAccepted: false,
    },
  })),

  acceptPolicy: (accepted) => set((state) => ({
    flow: { ...state.flow, policyAccepted: accepted },
  })),

  completePreprocess: () => set((state) => ({
    flow: { ...state.flow, dataAuthorized: true, preprocessed: true },
  })),

  syncServerApplication: (application) => set((state) => ({
    serverApplicationId: application?.id || state.serverApplicationId,
    serverVersion: Math.max(state.serverVersion, application?.version || 0),
  })),

  hydrateDraftFromServer: (application, results = []) => set((state) => {
    const empty = createEmptyDraft();
    const serverData = application?.data || {};
    const draft = {
      student: { ...empty.student, ...(serverData.student || {}), name: application?.studentName || '', documentNumber: application?.studentIdNumber || '' },
      family: { ...empty.family, ...(serverData.family || {}) },
      property: { ...empty.property, ...(serverData.property || {}) },
      materials: { ...empty.materials, ...(serverData.materials || {}) },
    };
    const household = results.find((item) => item.type === 'household')?.data;
    if (household?.householdHead) {
      draft.student.householdLocation = household.householdHead.address || '';
      draft.student.residenceAddress = household.householdHead.address || '';
      draft.family.householdHeadName = household.householdHead.name || '';
      draft.family.householdHeadDocument = household.householdHead.documentNumber || '';
      draft.family.householdAddress = household.householdHead.address || '';
    }
    if (household?.guardian) {
      draft.family.guardianName = household.guardian.name || '';
      draft.family.guardianDocument = household.guardian.documentNumber || '';
      draft.family.guardianPhone = household.guardian.phone || '';
    }
    const propertyRecords = results.find((item) => item.type === 'property')?.data?.records || [];
    if (propertyRecords.length) {
      draft.property.propertyMode = 'family';
      draft.property.records = propertyRecords.map((property, index) => ({
        id: property.id || `property-${index + 1}`,
        ownerName: property.owner || property.ownerName || '',
        ownerDocument: property.ownerDocument || '',
        relation: property.relation || '',
        certificateNumber: property.certificateNumber || '',
        address: property.address || '',
        usage: property.usage || '住宅',
        area: property.buildingArea ? String(property.buildingArea) : String(property.area || ''),
      }));
      const property = draft.property.records[0];
      draft.property.selectedPropertyId = property.id;
      draft.property.ownerName = property.ownerName;
      draft.property.ownerDocument = property.ownerDocument;
      draft.property.relation = property.relation;
      draft.property.certificateNumber = property.certificateNumber;
      draft.property.address = property.address;
      draft.property.usage = property.usage;
      draft.property.area = property.area;
    }
    const verificationReasons = Object.fromEntries(results
      .filter((item) => item?.type && item?.modificationReason)
      .map((item) => [item.type, item.modificationReason]));
    if (verificationReasons.household) {
      draft.student.modifiedReason = verificationReasons.household;
      draft.family.modifiedReason = verificationReasons.household;
    }
    if (verificationReasons.property) draft.property.modifiedReason = verificationReasons.property;
    const materialReason = verificationReasons.social_security
      || verificationReasons.business_license
      || verificationReasons.parents_no_property;
    if (materialReason) draft.materials.modifiedReason = materialReason;
    const linkedCodes = new Set((application?.materials || []).map((item) => item.itemCode));
    if (linkedCodes.size) {
      draft.materials = {
        ...draft.materials,
        householdBook: linkedCodes.has('household_book'),
        propertyProof: linkedCodes.has('property_certificate'),
        guardianId: linkedCodes.has('guardian_id'),
        studentPhoto: linkedCodes.has('student_photo'),
        studentRegistrationProof: linkedCodes.has('student_registration'),
        socialSecurity: linkedCodes.has('social_security_proof'),
        businessLicense: linkedCodes.has('business_license'),
        parentNoProperty: linkedCodes.has('parents_no_property_proof'),
      };
      if (draft.materials.studentPhoto) draft.student.photoName = '已上传';
    }
    return {
      draft,
      originalDraft: JSON.parse(JSON.stringify(draft)),
      selectedSchool: application?.school || state.selectedSchool,
      flow: application ? {
        ...state.flow,
        stageId: application.stage || state.flow.stageId,
        categoryId: application.category || state.flow.categoryId,
        schoolId: application.schoolId || application.school?.id || state.flow.schoolId,
      } : state.flow,
      serverApplicationId: application?.id || state.serverApplicationId,
      serverVersion: application?.version || state.serverVersion,
    };
  }),

  updateCluster: (cluster, values) => set((state) => ({
    draft: {
      ...state.draft,
      [cluster]: { ...state.draft[cluster], ...values },
    },
    savedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
  })),

  submitApplication: (serverApplication) => {
    const { flow, draft } = get();
    const stage = getStage(flow.stageId);
    const category = getCategory(flow.categoryId);
    const school = get().selectedSchool;
    set({
      application: {
        id: serverApplication.id,
        applicationNumber: serverApplication.submissionReceipt || serverApplication.id,
        studentName: serverApplication.studentName || draft.student.name,
        maskedStudentName: `${draft.student.name.slice(0, 1)}*${draft.student.name.slice(-1)}`,
        schoolName: serverApplication.school?.name || school?.name || '',
        stageName: stage.name,
        categoryName: category.name,
        status: serverApplication.statusLabel || '审核中',
        updatedAt: serverApplication.updatedAt || new Date().toLocaleString('zh-CN', { hour12: false }),
        hasUpdate: false,
        arrangement: null,
      },
    });
  },

  markApplicationRead: () => set((state) => ({
    application: state.application ? { ...state.application, hasUpdate: false } : null,
  })),

  resetDraft: () => set({
    flow: { ...DEFAULT_FLOW },
    selectedSchool: null,
    draft: createEmptyDraft(),
    originalDraft: createEmptyDraft(),
    application: null,
    serverApplicationId: null,
    serverVersion: 1,
    savedAt: '14:32',
  }),
}));

export default useEnrollmentStore;
