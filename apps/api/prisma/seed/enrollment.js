const stageNames = { kindergarten: '幼儿园', primary: '小学', middle: '初中' };
const categoryNames = { urban: '城区', non_urban: '非城区', private: '民办' };
const stages = Object.keys(stageNames);
const categories = Object.keys(categoryNames);

const schoolRows = [
  ['201', 'kindergarten', 'urban', '市实验幼儿园', '示例市朝阳路 18 号', '朝阳路、学府路两侧指定小区', ['household', 'property'], ['student_photo', 'household_book', 'property_certificate']],
  ['202', 'kindergarten', 'non_urban', '青禾中心幼儿园', '示例市青禾镇中心路 6 号', '青禾镇及周边行政村', ['household'], ['student_photo', 'household_book']],
  ['203', 'kindergarten', 'private', '启明星幼儿园', '示例市星河路 39 号', '面向全市自主招生', ['household'], ['student_photo', 'household_book']],
  ['204', 'primary', 'urban', '市第一实验小学', '示例市学府路 1 号', '学府路以东、朝阳路以西指定小区', ['household', 'property', 'parents_no_property'], ['student_photo', 'household_book', 'property_certificate', 'parents_no_property_proof']],
  ['205', 'primary', 'non_urban', '青禾中心小学', '示例市青禾镇教育路 8 号', '青禾镇及周边行政村', ['household', 'property'], ['student_photo', 'household_book']],
  ['206', 'primary', 'private', '博雅外国语学校小学部', '示例市博雅路 66 号', '面向全市自主招生', ['household'], ['student_photo', 'household_book']],
  ['207', 'middle', 'urban', '市实验初级中学', '示例市文昌路 28 号', '文昌路、学府路及朝阳路指定小区', ['household', 'property', 'social_security', 'business_license', 'parents_no_property'], ['student_photo', 'student_registration', 'household_book', 'property_certificate', 'social_security_proof', 'business_license', 'parents_no_property_proof']],
  ['208', 'middle', 'non_urban', '青禾初级中学', '示例市青禾镇育才路 12 号', '青禾镇及周边行政村', ['household', 'property'], ['student_photo', 'student_registration', 'household_book']],
  ['209', 'middle', 'private', '博雅外国语学校初中部', '示例市博雅路 66 号', '面向全市自主招生', ['household'], ['student_photo', 'student_registration', 'household_book']],
];

const contentRows = [
  ['301', 'banner', null, '阳光招生 便捷惠民', '招生政策、报名填报和结果查询一站办理', {}, '/enrollment/start', 1],
  ['302', 'notice', null, '2026 年秋季招生提醒', '请家长提前准备学生证件照、户口簿及房产等相关材料。', { body: ['部门数据查询失败不影响报名，可在填写页手工补充。'] }, null, 1],
  ['303', 'policy', null, '2026 年义务教育阶段招生工作指引', '区县统一政策说明', { sections: [{ title: '工作原则', paragraphs: ['坚持公开、公平、便民原则，具体报名条件以学校政策和审核结果为准。'] }] }, null, 1],
  ['304', 'faq', null, '部门数据没有查到怎么办？', '信息填写', { answer: '不会阻断报名。您可在对应信息页手工填写，并按学校要求上传图片材料。', category: '信息填写' }, null, 1],
  ['305', 'faq', null, '提交后还能修改吗？', '审核与修改', { answer: '提交后不能主动撤回。老师退回修改后，您可修改问题项和其他信息并重新提交。', category: '审核与修改' }, null, 2],
  ['306', 'faq', null, '初审不通过后可以重新报名吗？', '审核与修改', { answer: '可以。原报名保留为历史记录，您可重新选择其他学校报名。', category: '审核与修改' }, null, 3],
  ['307', 'guide', 'kindergarten', '幼儿园入学报名操作指南', '从学校选择到结果查询的完整步骤', { steps: ['选择报名类别和学校', '阅读并确认政策', '授权查询共享数据', '分组填写信息和上传材料', '预览并提交', '在我的报名查看审核结果'] }, null, 1],
  ['308', 'guide', 'primary', '幼升小报名操作指南', '从学校选择到结果查询的完整步骤', { steps: ['选择报名类别和学校', '阅读并确认政策', '授权查询共享数据', '分组填写信息和上传材料', '预览并提交', '在我的报名查看审核结果'] }, null, 1],
  ['309', 'guide', 'middle', '小升初报名操作指南', '从学校选择到结果查询的完整步骤', { steps: ['选择报名类别和学校', '阅读并确认政策', '授权查询共享数据', '分组填写信息和上传材料', '预览并提交', '在我的报名查看审核结果'] }, null, 1],
  ['311', 'service', null, '报名时间', '查看各学段报名安排', {}, 'schedule', 1],
  ['312', 'service', null, '招生政策', '了解最新招生政策', {}, 'policies', 2],
  ['313', 'service', null, '常见问答', '解答报名常见问题', {}, 'faq', 3],
  ['314', 'service', null, '查学区', '查询学区范围和对口学校', {}, 'district', 4],
  ['315', 'service', null, '房产学位查询', '查询房产学位占用情况', {}, 'property-degree', 5],
  ['316', 'service', null, '操作指南', '了解报名操作流程', {}, 'guide', 6],
];

async function seedEnrollment(prisma) {
  const { encrypt, digest } = require('../../src/modules/enrollment').seedCrypto;
  const season = await prisma.enrollmentSeason.upsert({
    where: { year: 2026 },
    update: {},
    create: { id: '660e8400-e29b-41d4-a716-446655440001', year: 2026, name: '2026 年秋季招生', active: true },
  });

  let sequence = 101;
  for (const stage of stages) {
    for (const category of categories) {
      const data = { startsAt: new Date('2026-08-01T00:30:00.000Z'), endsAt: new Date('2026-12-31T10:00:00.000Z') };
      await prisma.enrollmentWindow.upsert({
        where: { seasonId_stage_category: { seasonId: season.id, stage, category } },
        update: {},
        create: { id: `660e8400-e29b-41d4-a716-446655440${sequence}`, seasonId: season.id, stage, category, ...data },
      });
      sequence += 1;
    }
  }

  for (const [suffix, stage, category, name, address, scopeSummary, verificationTypes, materialItems] of schoolRows) {
    const id = `660e8400-e29b-41d4-a716-446655440${suffix}`;
    const policyTitle = `2026 年${name}招生政策`;
    const policyContent = {
      sections: [
        {
          title: '一、招生对象',
          paragraphs: [`符合${stageNames[stage]}入学年龄要求，并满足本校当年招生政策的适龄学生。`],
        },
        {
          title: '二、招生范围',
          paragraphs: [`本校招生范围为：${scopeSummary}。最终以学校审核结果为准。`],
        },
        {
          title: '三、报名材料',
          paragraphs: ['家长需在报名时按要求上传以下材料（原件拍照或扫描）：'],
          items: ['学生及监护人户口簿', '学生证件照', '合法住房证明或学校要求的其他证明材料'],
        },
        {
          title: '四、报名与审核流程',
          paragraphs: ['报名信息提交后由学校进行初审，家长可在“我的报名”中查看审核进度。'],
          items: ['选择学校并阅读招生政策', '授权查询共享数据并补充报名信息', '提交报名后等待学校审核', '初审通过后按统一发布的时间、地点参加线下审核'],
        },
        {
          title: '五、审核说明',
          paragraphs: [
            '共享数据仅用于辅助家长填写，不作为系统自动判定入学资格的依据，最终结果由学校结合招生政策审核确认。',
            '共享数据与实际情况不一致时允许修改，系统将对用户手动修改的内容进行标记，线下审核时需提供对应原件。',
          ],
        },
        {
          title: '六、温馨提醒',
          items: ['请在规定时间内完成报名，逾期将无法提交', '请确保联系电话准确并保持畅通', '上传图片应清晰、完整，不得遮挡关键信息', '提交前请认真核对全部信息，确保真实有效'],
        },
      ],
    };
    const formRules = { verificationTypes, materialItems, ...(verificationTypes.includes('parents_no_property') ? { parentsNoPropertyRequiredWhenGrandparentProperty: true } : {}) };
    const data = { seasonId: season.id, stage, category, name, address, scopeSummary, policyTitle, policyVersion: '2026-v1', policyContent, formRules, active: true, sort: 1 };
    await prisma.enrollmentSchool.upsert({ where: { id }, update: {}, create: { id, ...data } });
  }

  for (const [suffix, type, stage, title, summary, content, target, sort] of contentRows) {
    const id = `660e8400-e29b-41d4-a716-446655440${suffix}`;
    const data = { seasonId: season.id, type, stage, title, summary, content, target, active: true, sort };
    await prisma.enrollmentContent.upsert({ where: { id }, update: {}, create: { id, ...data } });
  }

  const userId = 'test-parent-001';
  const studentDocument = '320701201901012318';
  const address = '示例市朝阳路 88 号';
  const certificateNumber = 'DEMO-2026-0001';
  const father = { name: '李伟（演示）', documentNumber: '320701198403011234', phone: '13800000000', relation: '父亲' };
  const mother = { name: '王芳（演示）', documentNumber: '320701198605021234', phone: '13900000000', relation: '母亲' };
  await prisma.enrollmentProfile.upsert({ where: { userId }, update: {}, create: { userId,
    payloadEncrypted: encrypt({ student: { name: '李明（演示）', documentType: '居民身份证', documentNumber: studentDocument }, guardian: { name: mother.name, phone: mother.phone } }),
  } });
  const departmentData = {
    household: { student: { householdLocation: address, currentAddress: address }, guardian: mother, householdHead: { ...father, address } },
    property: { records: [{ owner: father.name, ownerDocument: father.documentNumber, relation: father.relation, certificateNumber, address, usage: '住宅', buildingArea: 96.8 }] },
    social_security: { records: [{ insuredPerson: father.name, documentNumber: father.documentNumber, region: '示例市', status: '正常参保', firstInsuredAt: '2020-01-01', continuousMonths: 80 }] },
    business_license: { records: [{ relation: '父亲', creditCode: 'DEMO-LICENSE-0001', entityName: '示例商店（虚构）', operator: father.name, type: '个体工商户', address: '示例市演示街 1 号', establishedAt: '2020-01-01', status: '存续' }] },
    parents_no_property: { father: { ...father, region: '示例市', result: '有房' }, mother: { ...mother, region: '示例市', result: '无房' } },
  };
  for (const [type, payload] of Object.entries(departmentData)) {
    const studentIdHash = digest(studentDocument);
    await prisma.enrollmentDepartmentRecord.upsert({ where: { userId_studentIdHash_type: { userId, studentIdHash, type } }, update: {},
      create: { userId, studentIdHash, type, source: 'demo:演示部门资料（非真实共享数据）', payloadEncrypted: encrypt(payload), active: true },
    });
  }
  for (const [id, name, description, suffixes] of [
    ['demo-chaoyang', '朝阳学区（演示）', '朝阳路、学府路两侧演示范围', ['201', '204', '207']],
    ['demo-qinghe', '青禾学区（演示）', '青禾镇及周边演示范围', ['202', '205', '208']],
  ]) {
    await prisma.enrollmentDistrict.upsert({ where: { id }, update: {}, create: { id, seasonId: season.id, name, description, sort: 1 } });
    for (const suffix of suffixes) {
      const relation = { districtId: id, schoolId: `660e8400-e29b-41d4-a716-446655440${suffix}` };
      await prisma.enrollmentDistrictSchool.upsert({ where: { districtId_schoolId: relation }, update: {}, create: relation });
    }
  }
  for (const [propertyAddress, certificate, status, year, stage] of [
    [address, certificateNumber, 'available', null, null],
    ['示例市朝阳路 90 号', 'DEMO-2026-0002', 'occupied', 2026, 'primary'],
  ]) {
    await prisma.enrollmentPropertyDegree.upsert({ where: { address: propertyAddress }, update: {},
      create: { address: propertyAddress, certificateHash: digest(certificate), status, year, stage },
    });
  }
  await prisma.enrollmentContent.upsert({ where: { id: '660e8400-e29b-41d4-a716-446655440310' }, update: {}, create: {
    id: '660e8400-e29b-41d4-a716-446655440310', seasonId: season.id, type: 'contact', title: '招生咨询（演示）',
    content: { label: '演示咨询点', number: '未配置真实号码', dial: '', hours: '工作日 09:00–17:00（演示）' }, active: true, sort: 1,
  } });

  for (const [type, suffix] of [['initial', '401'], ['final', '402']]) {
    await prisma.enrollmentPublication.upsert({
      where: { seasonId_type: { seasonId: season.id, type } },
      update: {},
      create: { id: `660e8400-e29b-41d4-a716-446655440${suffix}`, seasonId: season.id, type },
    });
  }
}


module.exports = { seedEnrollment };
