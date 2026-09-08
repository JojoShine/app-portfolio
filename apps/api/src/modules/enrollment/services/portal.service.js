const database = require('../db');
const enrollmentContent = database.enrollmentContent;
const enrollmentSchool = database.enrollmentSchool;
const enrollmentWindow = database.enrollmentWindow;
const { ValidationError, NotFoundError } = require('../../../common/utils/error');
const { getActiveSeason, serializeSchool } = require('./enrollment.shared');

const getPortal = async () => {
  const season = await getActiveSeason();
  const now = new Date();
  const [contents, windows] = await Promise.all([
    enrollmentContent.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ seasonId: season.id }, { seasonId: null }] },
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: [{ type: 'asc' }, { sort: 'asc' }],
    }),
    enrollmentWindow.findMany({
      where: { seasonId: season.id },
      orderBy: [{ stage: 'asc' }, { category: 'asc' }],
    }),
  ]);

  const grouped = contents.reduce((result, item) => {
    if (!result[item.type]) result[item.type] = [];
    result[item.type].push(item);
    return result;
  }, {});

  return {
    season: { id: season.id, year: season.year, name: season.name },
    banners: (grouped.banner || []).slice(0, 3),
    notices: grouped.notice || [],
    windows,
    services: ['registration_time', 'policy', 'faq', 'district', 'guide'],
  };
};

const getWindows = async ({ stage, category }) => {
  const season = await getActiveSeason();
  const where = { seasonId: season.id };
  if (stage) where.stage = stage;
  if (category) where.category = category;
  return enrollmentWindow.findMany({ where, orderBy: [{ stage: 'asc' }, { category: 'asc' }] });
};

const getSchools = async ({ stage, category, keyword }) => {
  const season = await getActiveSeason();
  const where = { seasonId: season.id, active: true };
  if (stage) where.stage = stage;
  if (category) where.category = category;
  if (keyword) where.name = { contains: keyword, mode: 'insensitive' };
  const schools = await enrollmentSchool.findMany({
    where,
    orderBy: [{ sort: 'asc' }, { name: 'asc' }],
  });
  const windows = await enrollmentWindow.findMany({ where: { seasonId: season.id } });
  const windowMap = new Map(windows.map((item) => [`${item.stage}:${item.category}`, item]));
  return schools.map((school) => ({
    ...serializeSchool(school),
    registration: windowMap.get(`${school.stage}:${school.category}`) || null,
  }));
};

const getSchool = async (id, includePolicy = false) => {
  const school = await enrollmentSchool.findFirst({ where: { id, active: true } });
  if (!school) throw new NotFoundError('学校不存在');
  const result = serializeSchool(school);
  if (includePolicy) result.policyContent = school.policyContent;
  return result;
};

const getContents = async ({ type, stage, category, keyword }) => {
  const season = await getActiveSeason();
  const where = {
    active: true,
    AND: [
      { OR: [{ seasonId: season.id }, { seasonId: null }] },
    ],
  };
  if (type) where.type = type;
  if (stage) where.AND.push({ OR: [{ stage }, { stage: null }] });
  if (category) where.AND.push({ OR: [{ category }, { category: null }] });
  if (keyword) {
    where.AND.push({
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
      ],
    });
  }
  return enrollmentContent.findMany({ where, orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }] });
};

const searchDistrict = async (keyword) => {
  const text = String(keyword || '').trim();
  if (text.length < 2) throw new ValidationError('请输入至少 2 个字的小区、道路或详细地址');
  const season = await getActiveSeason();
  const schools = await enrollmentSchool.findMany({
    where: {
      seasonId: season.id,
      active: true,
      OR: [
        { scopeSummary: { contains: text, mode: 'insensitive' } },
        { address: { contains: text, mode: 'insensitive' } },
      ],
    },
    orderBy: { sort: 'asc' },
  });
  return {
    keyword: text,
    notice: '查询结果仅供参考，请以当年招生政策和学校审核为准',
    schools: schools.map(serializeSchool),
  };
};

module.exports = {
  getPortal,
  getWindows,
  getSchools,
  getSchool,
  getContents,
  searchDistrict,
};
