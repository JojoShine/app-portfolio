const success = (data, message = '操作成功') => ({ code: 0, message, data });
const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString();
const uuid = () => globalThis.crypto?.randomUUID?.() || `mock-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const schoolRows = [
  ['201', 'kindergarten', 'urban', '市实验幼儿园', '海州市朝阳路18号', '朝阳路、学府路两侧指定小区', ['household', 'property']],
  ['202', 'kindergarten', 'non_urban', '青禾中心幼儿园', '海州市青禾镇中心路6号', '青禾镇及周边行政村', ['household']],
  ['203', 'kindergarten', 'private', '启明星幼儿园', '海州市星河路39号', '面向全市自主招生', ['household']],
  ['204', 'primary', 'urban', '市第一实验小学', '海州市学府路1号', '学府路以东、朝阳路以西指定小区', ['household', 'property', 'parents_no_property']],
  ['205', 'primary', 'non_urban', '青禾中心小学', '海州市青禾镇教育路8号', '青禾镇及周边行政村', ['household', 'property']],
  ['206', 'primary', 'private', '博雅外国语学校小学部', '海州市博雅路66号', '面向全市自主招生', ['household']],
  ['207', 'middle', 'urban', '市实验初级中学', '海州市文昌路28号', '文昌路、学府路及朝阳路指定小区', ['household', 'property', 'social_security', 'business_license', 'parents_no_property']],
  ['208', 'middle', 'non_urban', '青禾初级中学', '海州市青禾镇育才路12号', '青禾镇及周边行政村', ['household', 'property']],
  ['209', 'middle', 'private', '博雅外国语学校初中部', '海州市博雅路66号', '面向全市自主招生', ['household']],
];

const categoryNames = { urban: '城区', non_urban: '非城区', private: '民办' };
const stageNames = { kindergarten: '幼儿园入学报名', primary: '幼升小报名', middle: '小升初报名' };
const verificationNames = {
  household: '户籍信息',
  property: '不动产信息',
  social_security: '社保信息',
  business_license: '营业执照信息',
  parents_no_property: '父辈无房证明',
};
const policySections = (school) => [
  { title: '一、招生对象', paragraphs: [`符合${stageNames[school.stage]}年龄要求，并满足本校当年招生政策的适龄学生。`] },
  { title: '二、招生范围', paragraphs: [`本校招生范围为：${school.scopeSummary}。最终以学校审核结果为准。`] },
  { title: '三、报名材料', paragraphs: ['请准备学生及监护人证件、户口簿、学生证件照和学校要求的相关材料。'] },
  { title: '四、报名与审核', paragraphs: ['报名信息提交后由学校老师审核，共享数据仅辅助填写，不作为系统自动判定依据。'] },
  { title: '五、温馨提醒', items: ['请在规定时间内完成报名', '请确保联系电话准确', '上传图片应清晰完整', '提交前请认真核对信息'] },
];

const schools = schoolRows.map(([id, stage, category, name, address, scopeSummary, verificationTypes]) => {
  const school = {
    id,
    stage,
    category,
    categoryId: category,
    categoryLabel: `${categoryNames[category]}${category === 'private' ? '' : '公办'}`,
    name,
    address,
    scopeSummary,
    scope: scopeSummary,
    policyVersion: '2026-v1',
    dates: '8月1日—12月31日',
    registration: { startsAt: '2026-08-01T00:30:00.000Z', endsAt: '2026-12-31T10:00:00.000Z' },
    formRules: {
      verificationTypes,
      verificationItems: verificationTypes.map((type) => ({
        type,
        label: verificationNames[type],
        optional: ['social_security', 'business_license', 'parents_no_property'].includes(type),
      })),
    },
  };
  return { ...school, policyTitle: `2026年${name}招生政策`, policyContent: { sections: policySections(school) } };
});

const contents = [
  {
    id: '303',
    type: 'policy',
    title: '2026年秋季招生报名工作指引',
    summary: '幼儿园入学、幼升小和小升初统一招生政策说明',
    content: {
      sections: [
        { title: '一、招生对象', paragraphs: ['面向符合2026年秋季入学年龄及相关条件的幼儿园、小学一年级和初中一年级新生。具体年龄、户籍、居住及其他要求，以本年度招生安排为准。'] },
        { title: '二、报名范围', paragraphs: ['家长根据学生实际情况选择幼儿园入学、幼升小或小升初报名入口，并按城区、非城区或民办类别选择学校。每名学生应如实选择符合实际情况的报名学校。'] },
        { title: '三、报名方式', paragraphs: ['报名采用线上信息填报方式。系统可查询并带入部分共享数据，家长应逐项核对；共享数据不准确时允许修改并说明原因，未查询到数据不会阻断报名。'] },
        { title: '四、报名材料', paragraphs: ['请准备学生及监护人证件、户口簿、学生证件照和房产等相关材料。外来人员无房无户籍，或使用祖辈房产且学校有要求时，按页面提示补充社保、营业执照或父辈无房证明。'] },
        { title: '五、审核安排', paragraphs: ['报名提交后由学校老师进行审核，系统不自动判断是否符合报名条件。审核结果包括通过、退回修改和不通过；初审通过后的线下审核时间及地点由管理部门统一发布。'] },
        { title: '六、注意事项', items: ['请在规定的报名开始和截止时间内完成提交', '请确保填写信息真实、准确，上传图片清晰完整', '请保持联系电话畅通并及时查看“我的报名”状态', '最终录取结果以统一发布的信息为准'] },
      ],
    },
  },
  { id: '304', type: 'faq', title: '部门数据没有查到怎么办？', summary: '信息填写', content: { category: '信息填写', answer: '不会阻断报名，您可在对应页面手工填写并上传图片材料。' } },
  { id: '305', type: 'faq', title: '提交后还能修改吗？', summary: '审核与修改', content: { category: '审核与修改', answer: '老师退回修改后，可补充问题项并重新提交。' } },
  { id: '306', type: 'faq', title: '初审不通过后可以重新报名吗？', summary: '审核与修改', content: { category: '审核与修改', answer: '可以重新选择其他学校报名，原报名作为历史记录保留。' } },
  ...Object.entries(stageNames).map(([stage, name], index) => ({
    id: `guide-${index + 1}`,
    type: 'guide',
    stage,
    title: `${name}操作指南`,
    summary: '从学校选择到结果查询的完整操作说明',
    content: {
      steps: [
        { title: '选择报名入口与学校', description: `进入${name}入口，选择城区、非城区或民办类别，再选择本次报名学校。`, tip: '学校确认后将进入政策阅读页面' },
        { title: '阅读并确认招生政策', description: '认真查看招生对象、报名范围、材料要求和时间安排，确认无误后勾选已阅读。', tip: '政策内容由招生管理部门统一发布' },
        { title: '查询并核对共享数据', description: '填写基础查询信息并授权查询，系统会自动带入户籍、不动产等可用数据。', tip: '未查询到数据不会阻断报名' },
        { title: '完善信息与上传材料', description: '依次核对学生、监护人和户主信息，选择报名房产，并按要求拍照上传材料。', tip: '共享数据有误时可修改并标记原因' },
        { title: '预览报名信息并提交', description: '在预览页面完整核对已填写内容和材料，勾选真实性承诺后提交报名。', tip: '提交后报名状态将变为审核中' },
        { title: '查看报名与审核结果', description: '进入“我的报名”查看审核进度；被退回时按提示修改，通过后关注线下审核安排。', tip: '最终录取结果以统一发布信息为准' },
      ],
    },
  })),
];

const testUser = {
  id: 'test-parent-001',
  displayName: '测试家长',
  roles: ['parent'],
};

const draftData = {
  student: { name: '李昕然', documentType: '居民身份证', documentNumber: '320701201901012318', householdLocation: '海州市海州区', residenceAddress: '海州市海州区文教路18号', previousSchool: '春晖幼儿园', _departmentFields: ['name', 'documentType', 'documentNumber', 'householdLocation', 'residenceAddress'] },
  family: { guardianName: '王芳', guardianRelation: '母亲', guardianDocument: '320701198805015678', guardianPhone: '13800005678', householdHeadName: '李伟', householdHeadRelation: '父亲', householdHeadDocument: '320701198403011234', householdHeadPhone: '13900001234', householdAddress: '海州市海州区文教路18号', _departmentFields: ['guardianName', 'guardianRelation', 'guardianDocument', 'householdHeadName', 'householdHeadDocument', 'householdAddress'] },
  property: { hasProperty: true, ownerName: '李伟', ownerDocument: '320701198403011234', relation: '父亲', certificateNumber: '苏（2022）海州市不动产权第0001号', address: '海州市海州区文教路18号', usage: '住宅', area: '96.8', residenceAddress: '海州市海州区文教路18号', _departmentFields: ['ownerName', 'ownerDocument', 'relation'] },
  materials: { _departmentFields: ['socialDocument', 'socialRegion', 'socialStatus', 'socialFirstDate', 'socialMonths', 'businessCreditCode', 'businessName', 'businessOperator', 'businessType', 'businessAddress', 'businessEstablishedDate', 'businessStatus', 'noPropertyRegion', 'fatherNoPropertyResult', 'motherNoPropertyResult'] },
};

const makeApplication = (overrides = {}) => {
  const school = schools.find((item) => item.id === (overrides.schoolId || '201')) || schools[0];
  return {
    id: overrides.id || uuid(),
    applicationNumber: overrides.applicationNumber || `BM20260828${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
    submissionReceipt: overrides.submissionReceipt || null,
    studentName: overrides.studentName || '李昕然',
    studentIdNumber: overrides.studentIdNumber || '320701201901012318',
    schoolId: school.id,
    school,
    schoolName: school.name,
    stage: school.stage,
    category: school.category,
    status: overrides.status || 'draft',
    statusLabel: { draft: '待提交', reviewing: '审核中', returned: '退回修改', initial_approved: '初审通过', initial_rejected: '初审不通过', admitted: '已录取' }[overrides.status || 'draft'],
    version: overrides.version || 1,
    data: clone(overrides.data || draftData),
    materials: clone(overrides.materials || []),
    verifications: clone(overrides.verifications || []),
    createdAt: overrides.createdAt || now(),
    updatedAt: overrides.updatedAt || now(),
    ...overrides,
  };
};

const enrollmentApplications = new Map([
  ['demo-draft-001', makeApplication({ id: 'demo-draft-001', applicationNumber: 'BM202608280001', status: 'draft' })],
  ['demo-reviewing-002', makeApplication({ id: 'demo-reviewing-002', applicationNumber: 'BM202608280002', schoolId: '204', studentName: '测试学生', status: 'reviewing' })],
]);

const parseBody = (data) => {
  if (!data || typeof data !== 'string') return data || {};
  try { return JSON.parse(data); } catch { return {}; }
};

const response = (config, data, status = 200) => Promise.resolve({
  data: config.responseType === 'blob' ? data : success(data),
  status,
  statusText: status === 200 ? 'OK' : 'Created',
  headers: { 'x-mock-api': 'true' },
  config,
  request: { mock: true },
});

const verificationData = (type) => ({
  household: { householdHead: { name: '李伟', documentNumber: '320701198403011234', phone: '13900001234', relation: '父亲', address: '海州市海州区文教路18号' }, guardian: { name: '王芳', documentNumber: '320701198805015678', phone: '13800005678', relation: '母亲' } },
  property: { records: [
    { id: 'property-1', owner: '李伟', ownerDocument: '320701198403011234', relation: '父亲', certificateNumber: '苏（2022）海州市不动产权第0001号', address: '海州市海州区文教路18号', usage: '住宅', buildingArea: 96.8 },
    { id: 'property-2', owner: '李伟', ownerDocument: '320701198403011234', relation: '父亲', certificateNumber: '苏（2020）海州市不动产权第0038号', address: '海州市海州区春晖路26号', usage: '住宅', buildingArea: 82.4 },
  ] },
  social_security: { records: [], note: '暂未查到参保记录，可手工补充' },
  business_license: { records: [], note: '暂未查到营业执照，可手工补充' },
  parents_no_property: { father: { result: '未查到结果' }, mother: { result: '未查到结果' } },
}[type] || {});

const verificationSummary = (type, data) => ({
  household: data?.householdHead?.address || '已查询到户籍记录',
  property: data?.records?.[0]?.address || '未查询到房产记录',
  social_security: data?.note || '已完成社保信息查询',
  business_license: data?.note || '已完成营业执照查询',
  parents_no_property: '已完成父母双方房产核验',
}[type] || '查询完成');

export const mockApiAdapter = async (config) => {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const method = String(config.method || 'get').toLowerCase();
  const parsed = new URL(config.url || '/', 'http://mock.local');
  const path = parsed.pathname.replace(/^\/app-portfolio\/api|^\/api/, '');
  const params = { ...Object.fromEntries(parsed.searchParams.entries()), ...(config.params || {}) };
  const body = parseBody(config.data);

  if (method === 'post' && path === '/auth/development-token') return response(config, { accessToken: 'mock-parent-access-token', expiresIn: 86400 });
  if (method === 'get' && path === '/auth/me') return response(config, testUser);
  if (method === 'post' && path === '/files') return response(config, { id: uuid(), filename: '演示图片.jpg', mimeType: 'image/jpeg', size: 1024 }, 201);
  if (method === 'get' && /^\/files\//.test(path)) return response(config, new Blob(['mock-image'], { type: 'image/jpeg' }));

  if (method === 'get' && path === '/enrollment/portal') return response(config, { season: { year: 2026, name: '2026年秋季招生' }, banners: [], windows: [] });
  if (method === 'get' && path === '/enrollment/windows') {
    const rows = ['urban', 'non_urban', 'private'].map((category) => ({ id: `${params.stage || 'primary'}-${category}`, stage: params.stage || 'primary', category, startsAt: '2026-08-01T00:30:00.000Z', endsAt: '2026-12-31T10:00:00.000Z' }));
    return response(config, rows.filter((item) => !params.category || item.category === params.category));
  }
  if (method === 'get' && path === '/enrollment/schools') {
    const rows = schools.filter((item) => (!params.stage || item.stage === params.stage)
      && (!params.category || item.category === params.category)
      && (!params.keyword || `${item.name}${item.address}`.includes(params.keyword)));
    return response(config, rows);
  }
  const policyMatch = path.match(/^\/enrollment\/schools\/([^/]+)\/policy$/);
  if (method === 'get' && policyMatch) return response(config, schools.find((item) => item.id === decodeURIComponent(policyMatch[1])) || schools[0]);
  if (method === 'get' && path === '/enrollment/contents') return response(config, contents.filter((item) => (!params.type || item.type === params.type) && (!params.stage || !item.stage || item.stage === params.stage)));
  if (method === 'get' && path === '/enrollment/faqs') return response(config, contents.filter((item) => item.type === 'faq'));
  if (method === 'get' && path === '/enrollment/guides') return response(config, contents.filter((item) => item.type === 'guide' && (!params.stage || item.stage === params.stage)));
  if (method === 'get' && path === '/enrollment/districts') return response(config, {
    keyword: params.keyword,
    location: params.latitude && params.longitude ? { latitude: Number(params.latitude), longitude: Number(params.longitude) } : null,
    notice: '查询结果仅供参考，请以当年招生政策和学校审核为准。',
    regions: [
      { id: 'wenjiao', name: '文教学区', description: '覆盖文教路、育才路及周边住宅片区，具体边界以当年招生政策公布范围为准。' },
      { id: 'chaoyang', name: '朝阳学区', description: '覆盖朝阳路东段、学府路北段及相邻社区，学校根据实际报名情况进行审核。' },
      { id: 'chunhui', name: '春晖学区', description: '覆盖春晖社区、滨河片区及周边符合条件的住宅区域。' },
      { id: 'chengnan', name: '城南学区', description: '覆盖城南大道、科教新城及周边新建住宅片区。' },
    ],
    schools: schools.filter((item) => item.category === 'urban').slice(0, 2),
  });
  if (method === 'get' && path === '/enrollment/property-degrees') {
    const occupied = String(params.keyword || '').includes('26号');
    return response(config, {
      queryType: params.type || 'address',
      queryValue: params.keyword,
      degree: occupied
        ? { status: 'occupied', label: '学位已占用', year: '2026年', stage: '小学学段' }
        : { status: 'available', label: '学位未占用' },
      notice: '查询结果仅反映当前系统记录，最终以教育主管部门核验结果为准。',
    });
  }
  if (method === 'get' && path === '/enrollment/public/captcha') {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"><rect width="120" height="40" rx="6" fill="#eef3ff"/><text x="60" y="28" text-anchor="middle" font-family="Arial" font-size="24" font-weight="700" letter-spacing="7" fill="#244da8">2026</text></svg>';
    return response(config, { token: 'mock-captcha-token', image: `data:image/svg+xml,${encodeURIComponent(svg)}`, expiresIn: 300 });
  }
  const publicQueryMatch = path.match(/^\/enrollment\/public\/(initial|final)\/query$/);
  if (method === 'post' && publicQueryMatch) return response(config, { studentName: body.studentName, studentIdNumber: `************${body.studentIdLastSix}`, result: publicQueryMatch[1] === 'final' ? '已录取' : '初审通过', schoolName: '市第一实验小学', offlineArrangement: { status: 'pending' } });

  if (method === 'get' && path === '/enrollment/applications') return response(config, [...enrollmentApplications.values()]);
  if (method === 'post' && path === '/enrollment/applications') {
    const application = makeApplication({ id: uuid(), schoolId: body.schoolId, studentName: body.studentName, studentIdNumber: body.studentIdNumber, data: { ...clone(draftData), student: { ...clone(draftData.student), name: body.studentName, documentNumber: body.studentIdNumber } } });
    enrollmentApplications.set(application.id, application);
    return response(config, application, 201);
  }
  const applicationMatch = path.match(/^\/enrollment\/applications\/([^/]+)(?:\/(.*))?$/);
  if (applicationMatch) {
    const applicationId = decodeURIComponent(applicationMatch[1]);
    const action = applicationMatch[2] || '';
    const application = enrollmentApplications.get(applicationId) || makeApplication({ id: applicationId });
    enrollmentApplications.set(applicationId, application);
    if (method === 'get' && !action) return response(config, application);
    if (method === 'delete' && !action) {
      enrollmentApplications.delete(applicationId);
      return response(config, null);
    }
    if (method === 'post' && action === 'policy-confirmation') {
      application.version += 1;
      application.updatedAt = now();
      return response(config, clone(application));
    }
    if (method === 'post' && action === 'verifications') {
      const types = body.types?.length ? body.types : application.school.formRules.verificationTypes;
      const results = types.map((type) => {
        const data = verificationData(type);
        return {
          id: uuid(),
          type,
          label: verificationNames[type],
          summary: verificationSummary(type, data),
          status: 'success',
          data,
          source: `mock.${type}`,
          queriedAt: now(),
        };
      });
      application.verifications = results;
      application.version += 1;
      application.updatedAt = now();
      return response(config, { application: clone(application), results });
    }
    if (method === 'patch' && action === 'draft') {
      application.data = clone(body.data || application.data);
      application.studentName = body.studentName || application.data?.student?.name || application.studentName;
      application.studentIdNumber = body.studentIdNumber || application.data?.student?.documentNumber || application.studentIdNumber;
      application.version += 1;
      application.updatedAt = now();
      return response(config, clone(application));
    }
    if (method === 'post' && action === 'submit') {
      application.status = 'reviewing';
      application.statusLabel = '审核中';
      application.submissionReceipt = application.applicationNumber;
      application.version += 1;
      application.updatedAt = now();
      return response(config, clone(application));
    }
    if (method === 'post' && action === 'materials') {
      const material = { id: uuid(), fileId: body.fileId, itemCode: body.itemCode, sort: body.sort || 0 };
      application.materials.push(material);
      application.version += 1;
      return response(config, { ...material, version: application.version }, 201);
    }
    const materialMatch = action.match(/^materials\/([^/]+)$/);
    if (method === 'delete' && materialMatch) {
      application.materials = application.materials.filter((item) => item.id !== decodeURIComponent(materialMatch[1]));
      application.version += 1;
      return response(config, { version: application.version });
    }
  }

  return response(config, null);
};
