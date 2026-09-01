const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categoryRows = [
  ['550e8400-e29b-41d4-a716-446655440002', '营销服务', 1],
  ['550e8400-e29b-41d4-a716-446655440003', '商城服务', 2],
  ['550e8400-e29b-41d4-a716-446655440004', '教育服务', 3],
  ['550e8400-e29b-41d4-a716-446655440005', '社区服务', 4],
  ['550e8400-e29b-41d4-a716-446655440006', '通用服务', 5],
];

const appRows = [
  ['116', '招生报名', '幼儿园入学、幼升小和小升初报名服务', 'GraduationCap', '/enrollment', 'active', '004', 1],
  ['125', '消费券', '覆盖消费券发放、领取、查看与核销的全流程服务', 'Coupon', '/coupon', 'developing', '002', 1],
  ['126', '积分商城', '积分获取、商品兑换和兑换记录管理服务', 'Shopbag', '/points-mall', 'developing', '003', 1],
  ['127', '通用答题服务', '支持题库配置、在线答题、评分与结果查看', 'Content', '/quiz', 'developing', '006', 1],
  ['128', '智慧社区', '面向社区居民的通知、服务与事项办理入口', 'Team', '/smart-community', 'developing', '005', 1],
  ['129', '通用信息填报', '可配置表单、材料上传和填报记录管理服务', 'Fillin', '/information-collection', 'developing', '006', 2],
];

const legacyAppIds = Array.from(
  { length: 23 },
  (_, index) => `550e8400-e29b-41d4-a716-446655440${String(index + 102)}`
);
const legacyCategoryIds = Array.from(
  { length: 6 },
  (_, index) => `550e8400-e29b-41d4-a716-44665544000${index + 2}`
);

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
];

async function seedSystem() {
  const currentAppIds = appRows.map(([suffix]) => `550e8400-e29b-41d4-a716-446655440${suffix}`);
  const currentCategoryIds = categoryRows.map(([id]) => id);

  await prisma.app.deleteMany({
    where: { id: { in: legacyAppIds.filter((id) => !currentAppIds.includes(id)) } },
  });
  await prisma.category.deleteMany({
    where: { id: { in: legacyCategoryIds.filter((id) => !currentCategoryIds.includes(id)) } },
  });

  for (const [id, name, sort] of categoryRows) {
    await prisma.category.upsert({ where: { id }, update: { name, sort }, create: { id, name, sort } });
  }
  for (const [suffix, name, description, icon, path, status, categorySuffix, sort] of appRows) {
    const id = `550e8400-e29b-41d4-a716-446655440${suffix}`;
    const data = { name, description, icon, path, status, categoryId: `550e8400-e29b-41d4-a716-446655440${categorySuffix}`, isScenario: false, sort };
    await prisma.app.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
}

async function seedEnrollment() {
  const season = await prisma.enrollmentSeason.upsert({
    where: { year: 2026 },
    update: { name: '2026 年秋季招生', active: true },
    create: { id: '660e8400-e29b-41d4-a716-446655440001', year: 2026, name: '2026 年秋季招生', active: true },
  });

  let sequence = 101;
  for (const stage of stages) {
    for (const category of categories) {
      const data = { startsAt: new Date('2026-08-01T00:30:00.000Z'), endsAt: new Date('2026-12-31T10:00:00.000Z') };
      await prisma.enrollmentWindow.upsert({
        where: { seasonId_stage_category: { seasonId: season.id, stage, category } },
        update: data,
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
    await prisma.enrollmentSchool.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  for (const [suffix, type, stage, title, summary, content, target, sort] of contentRows) {
    const id = `660e8400-e29b-41d4-a716-446655440${suffix}`;
    const data = { seasonId: season.id, type, stage, title, summary, content, target, active: true, sort };
    await prisma.enrollmentContent.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  for (const [type, suffix] of [['initial', '401'], ['final', '402']]) {
    await prisma.enrollmentPublication.upsert({
      where: { seasonId_type: { seasonId: season.id, type } },
      update: {},
      create: { id: `660e8400-e29b-41d4-a716-446655440${suffix}`, seasonId: season.id, type },
    });
  }
}

async function main() {
  await seedSystem();
  await seedEnrollment();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
