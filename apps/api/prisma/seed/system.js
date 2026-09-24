const categoryRows = [
  ['550e8400-e29b-41d4-a716-446655440002', '营销服务', 1],
  ['550e8400-e29b-41d4-a716-446655440003', '商城服务', 2],
  ['550e8400-e29b-41d4-a716-446655440004', '教育服务', 3],
  ['550e8400-e29b-41d4-a716-446655440005', '社区服务', 4],
  ['550e8400-e29b-41d4-a716-446655440006', '通用服务', 5],
  ['550e8400-e29b-41d4-a716-446655440007', '便民服务', 6],
  ['550e8400-e29b-41d4-a716-446655440008', '智能服务', 7],
  ['550e8400-e29b-41d4-a716-446655440009', '生活服务', 8],
];

const appRows = [
  ['149', '图书馆服务', '支持馆藏查询、借阅续借、座位预约和阅读活动', 'BookOpen', '/library', 'active', '004', 1],
  ['127', '通用答题', '主题活动挑战、即时答案反馈、成绩回顾与排行榜', 'Content', '/quiz', 'active', '006', 2],
  ['126', '积分商城', '绿色签到、积分好礼与城市权益兑换', 'Shopbag', '/green-points', 'active', '003', 3],
  ['125', '消费券', '覆盖消费券发放、领取、查看与核销的全流程服务', 'Coupon', '/coupon', 'active', '002', 4],
  ['116', '招生报名', '幼儿园入学、幼升小和小升初报名服务', 'GraduationCap', '/enrollment', 'active', '004', 5],
  ['154', '随手拍', '拍照识别城市问题，确认位置并查看个人上报记录', 'Content', '/snap-report', 'active', '007', 0],
  ['155', '政策智能匹配', '根据个人与企业情况智能匹配可申报政策', 'Zap', '/policy-match', 'active', '008', 7],
  ['156', '社区议事', '围绕社区公共议题发起讨论、协商和意见征集', 'Team', '/community-discussion', 'developing', '005', 8],
  ['153', '人才服务', '覆盖人才认定、政策匹配、补贴申领和人才档案', 'Users', '/talent', 'developing', '009', 9],
  ['152', '医院服务', '提供预约挂号、候诊提醒、报告查询和就诊记录', 'Shield', '/hospital', 'developing', '009', 10],
  ['151', '旅游服务', '整合景点导览、路线规划、门票预约和游记分享', 'MapPin', '/travel', 'developing', '009', 11],
  ['148', '招聘服务', '提供职位发布、简历投递、面试安排和招聘进度管理', 'Briefcase', '/recruitment', 'developing', '009', 12],
  ['147', '线上预约', '支持服务预约、排班、排队、取消和到场核销', 'Content', '/online-booking', 'developing', '006', 13],
  ['141', '宠伴生活', '管理宠物档案、健康提醒、遛宠轨迹和走失寻回', 'Home', '/pet-life', 'developing', '009', 14],
  ['138', '社区闲置交换', '发布社区闲置物品，支持交换、赠送和邻里沟通', 'Team', '/community-swap', 'developing', '005', 15],
  ['136', '电子证照卡包', '集中管理个人电子证照、授权出示和使用记录', 'File', '/digital-credentials', 'developing', '007', 16],
  ['131', '公交实时到站', '查看公交线路、车辆位置、预计到站时间和换乘建议', 'Send', '/transit-arrival', 'developing', '007', 17],
  ['130', '城市停车助手', '查询停车场、剩余车位、收费标准并记录停车位置', 'MapPin', '/city-parking', 'developing', '007', 18],
  ['129', '通用信息填报', '可配置表单、材料上传和填报记录管理服务', 'Fillin', '/information-collection', 'developing', '006', 19],
].sort((left, right) => left[7] - right[7]).map((row, index) => [...row.slice(0, 7), index + 1]);

async function seedSystem(prisma) {
  for (const [id, name, sort] of categoryRows) {
    await prisma.category.upsert({ where: { id }, update: {}, create: { id, name, sort } });
  }
  for (const [suffix, name, description, icon, path, status, categorySuffix, sort] of appRows) {
    const id = `550e8400-e29b-41d4-a716-446655440${suffix}`;
    const data = { name, description, icon, path, status, categoryId: `550e8400-e29b-41d4-a716-446655440${categorySuffix}`, isScenario: false, sort };
    await prisma.app.upsert({ where: { id }, update: {}, create: { id, ...data } });
  }
}


module.exports = { seedSystem };
