const success = (data) => ({ code: 0, message: '操作成功', data });

const categories = [
  { id: '004', name: '教育服务', sort: 1 },
  { id: '002', name: '营销服务', sort: 2 },
  { id: '003', name: '商城服务', sort: 3 },
  { id: '005', name: '社区服务', sort: 4 },
  { id: '006', name: '通用服务', sort: 5 },
  { id: '007', name: '便民服务', sort: 6 },
  { id: '008', name: '智能服务', sort: 7 },
  { id: '009', name: '生活服务', sort: 8 },
];

const applications = [
  { id: '149', name: '图书馆服务', description: '支持馆藏查询、借阅续借、座位预约和阅读活动', icon: 'BookOpen', path: '/library', status: 'active', categoryId: '004', sort: 1 },
  { id: '127', name: '通用答题', description: '主题活动挑战、即时答案反馈、成绩回顾与排行榜', icon: 'Content', path: '/quiz', status: 'active', categoryId: '006', sort: 2 },
  { id: '126', name: '积分商城', description: '绿色签到、积分好礼与城市权益兑换', icon: 'Shopbag', path: '/green-points', status: 'active', categoryId: '003', sort: 3 },
  { id: '125', name: '消费券', description: '覆盖消费券发放、领取、查看与核销的全流程服务', icon: 'Coupon', path: '/coupon', status: 'active', categoryId: '002', sort: 4 },
  { id: '116', name: '招生报名', description: '幼儿园入学、幼升小和小升初报名服务', icon: 'GraduationCap', path: '/enrollment', status: 'active', categoryId: '004', sort: 5 },
  { id: '154', name: '随手拍', description: '拍照识别城市问题，确认位置并查看个人上报记录', icon: 'Content', path: '/snap-report', status: 'active', categoryId: '007', sort: 0 },
  { id: '155', name: '政策智能匹配', description: '个人与企业画像、可解释政策匹配与申报办理', icon: 'Zap', path: '/policy-match', status: 'active', categoryId: '008', sort: -1 },
  { id: '156', name: '社区议事', description: '围绕社区公共议题发起讨论、协商和意见征集', icon: 'Team', path: '/community-discussion', status: 'developing', categoryId: '005', sort: 8 },
  { id: '153', name: '人才服务', description: '覆盖人才认定、政策匹配、补贴申领和人才档案', icon: 'Users', path: '/talent', status: 'developing', categoryId: '009', sort: 9 },
  { id: '152', name: '医院服务', description: '提供预约挂号、候诊提醒、报告查询和就诊记录', icon: 'Shield', path: '/hospital', status: 'developing', categoryId: '009', sort: 10 },
  { id: '151', name: '旅游服务', description: '整合景点导览、路线规划、门票预约和游记分享', icon: 'MapPin', path: '/travel', status: 'developing', categoryId: '009', sort: 11 },
  { id: '148', name: '招聘服务', description: '提供职位发布、简历投递、面试安排和招聘进度管理', icon: 'Briefcase', path: '/recruitment', status: 'developing', categoryId: '009', sort: 12 },
  { id: '147', name: '线上预约', description: '支持服务预约、排班、排队、取消和到场核销', icon: 'Content', path: '/online-booking', status: 'developing', categoryId: '006', sort: 13 },
  { id: '141', name: '宠伴生活', description: '管理宠物档案、健康提醒、遛宠轨迹和走失寻回', icon: 'Home', path: '/pet-life', status: 'developing', categoryId: '009', sort: 14 },
  { id: '138', name: '社区闲置交换', description: '发布社区闲置物品，支持交换、赠送和邻里沟通', icon: 'Team', path: '/community-swap', status: 'developing', categoryId: '005', sort: 15 },
  { id: '136', name: '电子证照卡包', description: '集中管理个人电子证照、授权出示和使用记录', icon: 'File', path: '/digital-credentials', status: 'developing', categoryId: '007', sort: 16 },
  { id: '131', name: '公交实时到站', description: '查看公交线路、车辆位置、预计到站时间和换乘建议', icon: 'Send', path: '/transit-arrival', status: 'developing', categoryId: '007', sort: 17 },
  { id: '130', name: '城市停车助手', description: '查询停车场、剩余车位、收费标准并记录停车位置', icon: 'MapPin', path: '/city-parking', status: 'developing', categoryId: '007', sort: 18 },
  { id: '129', name: '通用信息填报', description: '可配置表单、材料上传和填报记录管理服务', icon: 'Fillin', path: '/information-collection', status: 'developing', categoryId: '006', sort: 19 },
].sort((left, right) => left.sort - right.sort).map((app, index) => ({ ...app, sort: index + 1 }));

const response = (config, data) => Promise.resolve({
  data: success(data),
  status: 200,
  statusText: 'OK',
  headers: { 'x-mock-api': 'true' },
  config,
  request: { mock: true },
});

export const catalogMockApiAdapter = (config) => {
  const method = String(config.method || 'get').toLowerCase();
  const path = new URL(config.url || '/', 'http://mock.local').pathname.replace(/^\/app-portfolio\/api|^\/api/, '');

  if (method === 'get' && path === '/app/apps') return response(config, applications);
  if (method === 'get' && path === '/app/categories') return response(config, categories);
  return null;
};
