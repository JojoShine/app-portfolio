const trimSlashes = (value) => String(value || '').replace(/^\/+|\/+$/g, '');

export const resolveApplicationAddress = (applicationPath, {
  publicSiteUrl,
  currentOrigin,
  basePath,
}) => {
  const normalizedPath = `/${trimSlashes(applicationPath)}`;
  const normalizedBasePath = trimSlashes(basePath) ? `/${trimSlashes(basePath)}` : '';
  const configuredBase = String(publicSiteUrl || '').replace(/\/+$/, '');
  const runtimeBase = `${String(currentOrigin || '').replace(/\/+$/, '')}${normalizedBasePath}`;
  const copyUrl = `${configuredBase || runtimeBase}${normalizedPath}`;
  let isLocalPreview = false;

  try {
    const hostname = new URL(currentOrigin).hostname;
    isLocalPreview = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    isLocalPreview = false;
  }

  return {
    displayUrl: !configuredBase && isLocalPreview ? `${normalizedBasePath}${normalizedPath}` : copyUrl,
    copyUrl,
  };
};

/**
 * 编译期应用注册表。数据库目录决定“展示什么”，此处决定“前端真正能运行什么”。
 * 新应用必须显式注册，避免后端数据可以注入任意前端路由。
 *
 * 示例：
 * {
 *   id: 'sample',
 *   path: '/sample',
 *   load: () => import('../../modules/sample'),
 * }
 */
export const applicationModules = Object.freeze([
  {
    id: 'policy-match', path: '/policy-match', overviewPath: '/showcase/policy-match',
    load: () => import('../../modules/policy-match'),
    profile: {
      logo: 'Zap', name: '政策智能匹配', tagline: '好政策，主动找到你',
      businessIntroduction: '根据个人与企业画像，逐项核对政策条件，提供可解释匹配与申报办理服务。',
      problemStatement: '让政策条件易理解、申报材料有清单、办理进度可追踪。',
      features: ['个人与企业画像及智能匹配', '政策条件解释、收藏与对比', '站内模拟申报与材料上传', '外部办理指南和申报进度记录'],
    },
  },
  {
    id: 'snap-report', path: '/snap-report', overviewPath: '/showcase/snap-report',
    load: () => import('../../modules/snap-report'),
    profile: {
      logo: 'Content', name: '随手拍', tagline: '拍下身边问题，识别后确认上报',
      businessIntroduction: '面向海安市民，将现场拍照、智能识别、位置确认与问题上报整合在一个页面中。',
      problemStatement: '减少上报时反复选类别、描述问题和补充位置的操作，让身边的公共设施与环境问题更容易被记录。',
      features: ['拍摄或相册上传多张照片', 'AI 辅助识别对象、问题和程度', '确认发生位置并提交上报', '查看本人的上报记录和详情'],
    },
  },
  {
    id: 'quiz',
    path: '/quiz',
    overviewPath: '/showcase/quiz',
    load: () => import('../../modules/quiz'),
    profile: {
      logo: 'Content',
      name: '通用答题',
      tagline: '让主题活动从出题到复盘形成完整闭环',
      businessIntroduction: '面向知识宣传、主题竞赛和培训考核场景，提供一套可快速组织线上答题活动的轻量应用。',
      problemStatement: '解决线下答题组织成本高、参与过程缺少即时反馈、活动结束后难以沉淀成绩与复盘数据的问题。',
      features: ['主题活动展示与状态筛选', '单选、多选和判断题在线作答', '即时判题与答案解析', '成绩回顾、参与记录与排行榜'],
    },
  },
  {
    id: 'green-points',
    path: '/green-points',
    overviewPath: '/showcase/green-points',
    load: () => import('../../modules/green-points'),
    profile: {
      logo: 'Shopbag',
      name: '积分商城',
      tagline: '把绿色行为转化为看得见、用得上的城市权益',
      businessIntroduction: '围绕会员积分运营搭建签到、任务、兑换和订单服务，帮助运营方用持续激励连接用户与城市生活权益。',
      problemStatement: '解决积分来源不清晰、权益触达分散、兑换流程割裂，以及用户缺少持续参与动力的问题。',
      features: ['每日签到与积分明细', '商品和城市权益兑换', '优惠券、订单与地址管理', '收藏足迹和客服反馈'],
    },
  },
  {
    id: 'coupon',
    path: '/coupon',
    overviewPath: '/showcase/coupon',
    load: () => import('../../modules/coupon'),
    profile: {
      logo: 'Coupon',
      name: '消费券',
      tagline: '连接活动运营、用户领券与商户核销',
      businessIntroduction: '为促消费活动提供从券包发放到门店核销的完整移动端服务，兼顾消费者使用体验与商户操作效率。',
      problemStatement: '解决活动信息分散、券状态难查询、适用商户不直观，以及人工核销效率低且记录难追溯的问题。',
      features: ['消费券活动浏览与领取', '个人券包和使用规则查看', '适用商户查询', '扫码、手动核销与核销记录'],
    },
  },
  {
    id: 'library',
    path: '/library',
    overviewPath: '/showcase/library',
    load: () => import('../../modules/library'),
    profile: {
      logo: 'BookOpen',
      name: '图书馆服务',
      tagline: '把馆藏、空间与阅读活动装进一站式服务入口',
      businessIntroduction: '面向公共图书馆读者整合图书检索、借阅服务、座位预约和阅读活动，让常用服务在手机上即可完成。',
      problemStatement: '解决读者需要在多个入口间查找服务、馆藏与座位信息不易获取、活动报名和个人借阅记录分散的问题。',
      features: ['馆藏检索与图书详情', '借阅、续借和预约管理', '馆舍服务与座位预约', '阅读活动、消息和阅读计划'],
    },
  },
  {
    id: 'enrollment',
    path: '/enrollment',
    overviewPath: '/showcase/enrollment',
    load: () => import('../../modules/enrollment'),
    profile: {
      logo: 'GraduationCap',
      name: '招生报名',
      tagline: '让入学报名流程更清楚，材料提交更省心',
      businessIntroduction: '服务幼儿园入学、幼升小和小升初报名，覆盖政策查询、学校选择、信息填报、材料提交与审核结果查询。',
      problemStatement: '解决招生政策理解成本高、报名材料反复填写、办理进度不透明，以及学校审核信息难统一的问题。',
      features: ['招生政策与学校信息查询', '分步骤报名信息填报', '材料上传与数据授权核验', '报名记录、审核进度与结果查询'],
    },
  },
]);

export const registeredApplicationPaths = new Set(
  applicationModules.map((application) => application.path)
);

export const applicationByPath = new Map(
  applicationModules.map((application) => [application.path, application])
);
