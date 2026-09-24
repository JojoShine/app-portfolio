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
  serverMaterials: [],
  serverApplicationId: null,
  serverVersion: 1,
  savedAt: '',
  seasonYear: null,
  portalServices: [],
  setPortalData: (portal) => set({
    seasonYear: portal?.season?.year || null,
    portalServices: Array.isArray(portal?.services) ? portal.services : [],
  }),

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
    const verifiedData = (type) => {
      const result = results.find((item) => item.type === type && item.status === 'success');
      return result?.data || result?.declaredData || result?.originalData;
    };
    const applyDepartmentFields = (cluster, values) => {
      Object.entries(values).forEach(([field, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (!Object.hasOwn(serverData[cluster] || {}, field)) draft[cluster][field] = String(value);
        if (!draft[cluster]._departmentFields.includes(field)) draft[cluster]._departmentFields.push(field);
      });
    };
    const household = verifiedData('household');
    applyDepartmentFields('student', {
      householdLocation: household?.student?.householdLocation,
      residenceAddress: household?.student?.currentAddress,
    });
    applyDepartmentFields('family', {
      guardianName: household?.guardian?.name, guardianDocument: household?.guardian?.documentNumber,
      guardianPhone: household?.guardian?.phone, guardianRelation: household?.guardian?.relation,
      householdHeadName: household?.householdHead?.name, householdHeadDocument: household?.householdHead?.documentNumber,
      householdHeadPhone: household?.householdHead?.phone, householdHeadRelation: household?.householdHead?.relation,
      householdAddress: household?.householdHead?.address,
    });
    const propertyRecords = verifiedData('property')?.records || [];
    if (propertyRecords.length) {
      draft.property.propertyMode = 'family';
      draft.property.records = propertyRecords.map((property, index) => ({
        id: property.id || `property-${index + 1}`,
        ownerName: property.owner || property.ownerName || '',
        ownerDocument: property.ownerDocument || '',
        relation: property.relation || '',
        certificateNumber: property.certificateNumber || '',
        address: property.address || '',
        usage: property.usage || '',
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
      applyDepartmentFields('property', Object.fromEntries(Object.entries(property).filter(([key]) => key !== 'id')));
    }
    const social = verifiedData('social_security')?.records?.[0];
    if (social) {
      draft.materials.socialEnabled = serverData.materials?.socialEnabled ?? true;
      applyDepartmentFields('materials', {
        socialPerson: social.insuredPerson, socialDocument: social.documentNumber,
        socialRegion: social.region, socialStatus: social.status,
        socialFirstDate: social.firstInsuredAt, socialMonths: social.continuousMonths,
      });
    }
    const business = verifiedData('business_license')?.records?.[0];
    if (business) {
      draft.materials.businessEnabled = serverData.materials?.businessEnabled ?? true;
      applyDepartmentFields('materials', {
        businessOwnerRelation: business.relation, businessCreditCode: business.creditCode,
        businessName: business.entityName, businessOperator: business.operator,
        businessType: business.type, businessAddress: business.address,
        businessEstablishedDate: business.establishedAt, businessStatus: business.status,
      });
    }
    const noProperty = verifiedData('parents_no_property');
    if (noProperty) {
      draft.materials.noPropertyEnabled = serverData.materials?.noPropertyEnabled ?? true;
      applyDepartmentFields('materials', {
        noPropertyRegion: noProperty.father?.region || noProperty.mother?.region,
        fatherNoPropertyName: noProperty.father?.name, fatherNoPropertyDocument: noProperty.father?.documentNumber,
        fatherNoPropertyResult: noProperty.father?.result,
        motherNoPropertyName: noProperty.mother?.name, motherNoPropertyDocument: noProperty.mother?.documentNumber,
        motherNoPropertyResult: noProperty.mother?.result,
      });
    }
    // Saved declarations take precedence over the original departmental response.
    Object.keys(draft).forEach((cluster) => {
      const fields = draft[cluster]._departmentFields;
      draft[cluster] = { ...draft[cluster], ...serverData[cluster], _departmentFields: fields };
    });
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
      serverMaterials: application?.materials || [],
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

  addServerMaterial: (material) => set((state) => ({ serverMaterials: [...state.serverMaterials, material] })),
  removeServerMaterial: (materialId) => set((state) => ({
    serverMaterials: state.serverMaterials.filter((material) => material.id !== materialId),
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
        stageName: serverApplication.stageLabel || stage.name,
        categoryName: serverApplication.categoryLabel || category.name,
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
    serverMaterials: [],
    serverApplicationId: null,
    serverVersion: 1,
    savedAt: '',
  }),
}));

export default useEnrollmentStore;
