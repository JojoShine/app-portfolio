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
  { id: '116', name: '招生报名', description: '幼儿园入学、幼升小和小升初报名服务', icon: 'GraduationCap', path: '/enrollment', status: 'active', categoryId: '004', sort: 1 },
  { id: '125', name: '消费券', description: '覆盖消费券发放、领取、查看与核销的全流程服务', icon: 'Coupon', path: '/coupon', status: 'developing', categoryId: '002', sort: 2 },
  { id: '126', name: '积分商城', description: '积分获取、商品兑换和兑换记录管理服务', icon: 'Shopbag', path: '/points-mall', status: 'developing', categoryId: '003', sort: 3 },
  { id: '127', name: '通用答题服务', description: '支持题库配置、在线答题、评分与结果查看', icon: 'Content', path: '/quiz', status: 'developing', categoryId: '006', sort: 4 },
  { id: '128', name: '智慧社区', description: '面向社区居民的通知、服务与事项办理入口', icon: 'Team', path: '/smart-community', status: 'developing', categoryId: '005', sort: 5 },
  { id: '129', name: '通用信息填报', description: '可配置表单、材料上传和填报记录管理服务', icon: 'Fillin', path: '/information-collection', status: 'developing', categoryId: '006', sort: 6 },
  { id: '130', name: '城市停车助手', description: '查询停车场、剩余车位、收费标准并记录停车位置', icon: 'MapPin', path: '/city-parking', status: 'developing', categoryId: '007', sort: 7 },
  { id: '131', name: '公交实时到站', description: '查看公交线路、车辆位置、预计到站时间和换乘建议', icon: 'Send', path: '/transit-arrival', status: 'developing', categoryId: '007', sort: 8 },
  { id: '132', name: '城市便民地图', description: '在地图中集中查找公共设施、便民网点和服务信息', icon: 'MapPin', path: '/city-service-map', status: 'developing', categoryId: '007', sort: 9 },
  { id: '133', name: 'AI错题本', description: '识别错题、归纳知识点并生成针对性练习和复习计划', icon: 'BookOpen', path: '/ai-error-book', status: 'developing', categoryId: '004', sort: 10 },
  { id: '134', name: '校园接送码', description: '生成动态接送凭证，记录授权人员和学生接送过程', icon: 'Shield', path: '/campus-pickup', status: 'developing', categoryId: '004', sort: 11 },
  { id: '135', name: '研学任务地图', description: '以地图和任务卡组织研学路线、打卡与成果记录', icon: 'MapPin', path: '/study-tour-map', status: 'developing', categoryId: '004', sort: 12 },
  { id: '136', name: '电子证照卡包', description: '集中管理个人电子证照、授权出示和使用记录', icon: 'File', path: '/digital-credentials', status: 'developing', categoryId: '007', sort: 13 },
  { id: '137', name: '老照片修复馆', description: '修复老照片划痕、模糊与褪色并生成对比作品', icon: 'Content', path: '/photo-restoration', status: 'developing', categoryId: '008', sort: 14 },
  { id: '138', name: '社区闲置交换', description: '发布社区闲置物品，支持交换、赠送和邻里沟通', icon: 'Team', path: '/community-swap', status: 'developing', categoryId: '005', sort: 15 },
  { id: '139', name: '临时组队助手', description: '围绕运动、活动和兴趣快速发起并加入临时队伍', icon: 'Users', path: '/team-up', status: 'developing', categoryId: '006', sort: 16 },
  { id: '140', name: '旅行费用分账', description: '记录多人旅行开支，自动计算分摊结果和待结金额', icon: 'DollarSign', path: '/travel-split', status: 'developing', categoryId: '009', sort: 17 },
  { id: '141', name: '宠伴生活', description: '管理宠物档案、健康提醒、遛宠轨迹和走失寻回', icon: 'Home', path: '/pet-life', status: 'developing', categoryId: '009', sort: 18 },
  { id: '142', name: '独居老人安全守护', description: '结合居家设备监测异常状态并向家属发送安全提醒', icon: 'Shield', path: '/elderly-safety', status: 'developing', categoryId: '008', sort: 19 },
  { id: '143', name: '防走失定位卡', description: '通过定位卡查看位置、安全区域和紧急求助信息', icon: 'MapPin', path: '/anti-lost-card', status: 'developing', categoryId: '008', sort: 20 },
  { id: '144', name: '随身视觉助手', description: '通过图像识别和语音描述辅助识物、读字与环境感知', icon: 'Zap', path: '/visual-assistant', status: 'developing', categoryId: '008', sort: 21 },
  { id: '145', name: 'AI面试练习室', description: '模拟真实面试问答并提供表达分析和改进建议', icon: 'Briefcase', path: '/ai-interview', status: 'developing', categoryId: '008', sort: 22 },
  { id: '146', name: '情绪音乐日记', description: '记录每日情绪与音乐，形成可回顾的个人情绪轨迹', icon: 'Content', path: '/mood-music-diary', status: 'developing', categoryId: '008', sort: 23 },
  { id: '147', name: '线上预约', description: '支持服务预约、排班、排队、取消和到场核销', icon: 'Content', path: '/online-booking', status: 'developing', categoryId: '006', sort: 24 },
  { id: '148', name: '招聘服务', description: '提供职位发布、简历投递、面试安排和招聘进度管理', icon: 'Briefcase', path: '/recruitment', status: 'developing', categoryId: '009', sort: 25 },
  { id: '149', name: '图书馆服务', description: '支持馆藏查询、借阅续借、座位预约和阅读活动', icon: 'BookOpen', path: '/library', status: 'developing', categoryId: '004', sort: 26 },
  { id: '150', name: '志愿者服务', description: '提供志愿活动报名、签到、服务时长和证书管理', icon: 'Team', path: '/volunteer', status: 'developing', categoryId: '005', sort: 27 },
  { id: '151', name: '旅游服务', description: '整合景点导览、路线规划、门票预约和游记分享', icon: 'MapPin', path: '/travel', status: 'developing', categoryId: '009', sort: 28 },
  { id: '152', name: '医院服务', description: '提供预约挂号、候诊提醒、报告查询和就诊记录', icon: 'Shield', path: '/hospital', status: 'developing', categoryId: '009', sort: 29 },
  { id: '153', name: '人才服务', description: '覆盖人才认定、政策匹配、补贴申领和人才档案', icon: 'Users', path: '/talent', status: 'developing', categoryId: '009', sort: 30 },
];

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
