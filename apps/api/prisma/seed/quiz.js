'use strict';

const path = require('node:path');

const single = (title, options, correct, explanation) => ({ type: 'single', title, options, correct: [correct], explanation });
const multi = (title, options, correct, explanation) => ({ type: 'multi', title, options, correct, explanation });
const judge = (title, correct, explanation) => ({ type: 'judge', title, options: ['正确', '错误'], correct: [correct ? 0 : 1], explanation });

const questions = [
  single('去城市图书馆阅读，哪种做法更合适？', ['在阅览区大声接电话', '保持安静，爱护公共图书', '随意折叠书页', '用物品长期占座'], 1, '保持安静、爱护图书，让大家都能安心阅读。'),
  multi('参加公共文化活动时，哪些做法更合适？', ['提前了解活动安排', '遵守现场秩序', '随意丢弃活动资料', '爱护公共设施'], [0, 1, 3], '了解安排、遵守秩序并爱护公共设施，能让大家获得更好的活动体验。'),
  judge('博物馆里的文物可以随意触摸。', false, '请遵守展馆规定，不随意触摸展品，共同保护文化遗产。'),
  single('地图上的指北针通常用哪个字母表示北方？', ['S', 'E', 'N', 'W'], 2, 'N代表北，S代表南，E代表东，W代表西。'),
  single('过人行横道时，看到红灯应该怎么做？', ['迅速跑过', '在安全区域等候绿灯', '跟着别人通过', '只看车辆不看信号'], 1, '遵守交通信号，绿灯亮起后仍要观察车辆，确认安全再通行。'),
  multi('哪些做法有助于保持公园整洁？', ['垃圾投入相应垃圾桶', '带走野餐产生的垃圾', '把纸巾留在草地上', '不随意涂画设施'], [0, 1, 3], '妥善处理垃圾、不涂画公共设施，是文明游园的基本做法。'),
  judge('在公共场所拍照时，也应尊重他人的隐私。', true, '拍照和分享照片时应尊重他人的隐私与意愿。'),
  single('城市里的斑马线主要供谁通行？', ['行人', '停车车辆', '自行车比赛选手', '施工机械'], 0, '斑马线是人行横道标线，帮助行人安全横过道路。'),
  single('下列哪一种交通方式更适合短距离低碳出行？', ['独自开燃油车', '步行', '乘坐飞机', '绕路打车'], 1, '在条件适宜的短距离出行中，步行不产生车辆尾气。'),
  multi('在图书馆借阅图书，哪些做法值得提倡？', ['按期归还', '保持书籍整洁', '在书上做永久标记', '需要延长借阅时办理续借'], [0, 1, 3], '按期归还、爱护书籍并按规则续借，方便更多读者使用。'),
  single('日常生活中，哪个行为更节约用水？', ['刷牙时一直开着水龙头', '及时修理漏水的水龙头', '用流水长时间冲洗地面', '让水满溢水桶'], 1, '及时修理漏水设施，可以减少持续发生的水资源浪费。'),
  judge('公共设施由大家共同使用，需要共同爱护。', true, '爱护公共设施能延长使用寿命，方便每一位使用者。'),
  single('植物通过光合作用主要利用哪种能量？', ['太阳光能', '声音', '磁能', '摩擦产生的能量'], 0, '绿色植物通过光合作用利用光能，制造有机物。'),
  multi('参观展览时，哪些行为是合适的？', ['遵守拍摄规定', '排队有序进入', '跨越展品护栏', '听从现场工作人员指引'], [0, 1, 3], '遵守展览规定和现场指引，能保护展品并保障参观秩序。'),
  single('一年四季中，通常位于夏季之后的是？', ['春季', '冬季', '秋季', '雨季'], 2, '四季通常按春、夏、秋、冬依次循环。'),
  judge('看到公共座椅损坏，可以向管理人员反映。', true, '及时反映损坏情况，有助于管理人员维修并消除不便。'),
  single('乘坐公共交通时，哪种做法更文明？', ['外放音视频', '先下后上，有序乘车', '堵住车门聊天', '把行李放在通道中间'], 1, '先下后上、有序乘车，并保持通道畅通，有利于大家安全出行。'),
  multi('参加户外活动前，可以做哪些准备？', ['了解天气情况', '准备合适的饮用水', '不看路线随意出发', '了解活动路线'], [0, 1, 3], '了解天气和路线、准备饮水，有助于获得更舒适的户外体验。'),
  judge('文化遗产只包括建筑，不包括传统技艺。', false, '文化遗产既包括建筑等物质遗产，也包括传统技艺等非物质文化遗产。'),
  single('想了解一座城市的历史，下面哪个场所最适合优先参观？', ['城市历史博物馆', '停车场', '便利店', '加油站'], 0, '城市历史博物馆通常通过实物、图片和文字介绍城市的发展历程。'),
];

const activities = [
  { id: 'city', title: '城市知识挑战', description: '探索身边的知识，发现城市的精彩', type: 'city', count: 20, minutes: 15, start: '2026-01-01T00:00:00+08:00', end: '2030-12-31T23:59:59+08:00', offset: 0, sort: 1 },
  { id: 'science', title: '生活科学知多少', description: '生活里的小发现，藏着有趣的大知识', type: 'science', count: 15, minutes: 10, start: '2026-01-01T00:00:00+08:00', end: '2030-12-31T23:59:59+08:00', offset: 5, sort: 2 },
  { id: 'culture', title: '传统文化趣味答题', description: '走近文化之美，寻找时光中的智慧', type: 'culture', count: 20, minutes: 15, start: '2027-01-01T00:00:00+08:00', end: '2030-12-31T23:59:59+08:00', offset: 0, sort: 3 },
  { id: 'safety', title: '安全知识小挑战', description: '把安全记在心里，让生活更安心', type: 'safety', count: 10, minutes: 8, start: '2026-01-01T00:00:00+08:00', end: '2026-09-01T00:00:00+08:00', offset: 0, sort: 4 },
];

const assets = [
  ['city', 'quiz/city.png', 'city.png'],
  ['topics', 'quiz/topics.png', 'topics.png'],
  ['banner-city', 'quiz/banner-city.png', 'banner-city.png'],
  ['banner-science', 'quiz/banner-science.png', 'banner-science.png'],
  ['banner-culture', 'quiz/banner-culture.png', 'banner-culture.png'],
  ['banner-safety', 'quiz/banner-safety.png', 'banner-safety.png'],
];

async function seedQuiz(prisma) {
  for (const [id, objectKey] of assets) {
    await prisma.quizAsset.upsert({ where: { id }, update: {}, create: { id, objectKey, mimeType: 'image/png' } });
  }
  for (const activity of activities) {
    await prisma.quizActivity.upsert({ where: { id: activity.id }, update: {}, create: {
      id: activity.id, title: activity.title, description: activity.description, type: activity.type,
      minutes: activity.minutes, startsAt: new Date(activity.start), endsAt: new Date(activity.end),
      imageAssetId: `banner-${activity.type}`, thumbnailAssetId: activity.type === 'city' ? 'city' : 'topics', sort: activity.sort,
    } });
    for (let position = 0; position < activity.count; position += 1) {
      const question = questions[(position + activity.offset) % questions.length];
      const id = `${activity.id}-${position + 1}`;
      await prisma.quizQuestion.upsert({ where: { id }, update: {}, create: { id, activityId: activity.id, position, ...question } });
    }
    for (const [index, name] of ['小禾', '晴天', '木木', '阿星', '林间风', '小满', '向日葵', '远山', '星河', '小鹿', '晨光', '听风', '阿橙', '北北', '南山'].entries()) {
      const id = `${activity.id}-demo-${index}`;
      await prisma.quizRankingEntry.upsert({ where: { id }, update: {}, create: {
        id, activityId: activity.id, displayName: name,
        score: Math.max(0, 100 - Math.floor(index / 2) * 5),
        seconds: 210 + (index % 2) * 35 + Math.floor(index / 2) * 13,
        avatarIndex: index,
      } });
    }
  }
}

async function seedQuizAssets(assetStore) {
  const sourceDir = path.resolve(__dirname, 'assets/quiz');
  for (const [, objectKey, filename] of assets) {
    await assetStore.uploadFile({ objectKey, sourcePath: path.join(sourceDir, filename), mimeType: 'image/png' });
  }
}

module.exports = { seedData: seedQuiz, seedAssets: seedQuizAssets };
