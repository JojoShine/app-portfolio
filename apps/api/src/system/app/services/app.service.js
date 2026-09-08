const database = require('../../../config/database');
const { NotFoundError } = require('../../../common/utils/error');

const APP_INCLUDE = Object.freeze({
  category: { select: { id: true, name: true } },
});

const toAppView = (record) => {
  if (!record || !Object.prototype.hasOwnProperty.call(record, 'category')) return record;
  const { category, ...app } = record;
  return { ...app, Category: category };
};

const getAllApps = async () => {
  const apps = await database.app.findMany({
    include: APP_INCLUDE,
    orderBy: { sort: 'asc' },
  });
  return apps.map(toAppView);
};

const getAppsByCategory = async (categoryId) => {
  const apps = await database.app.findMany({
    where: { categoryId },
    include: APP_INCLUDE,
    orderBy: { sort: 'asc' },
  });
  return apps.map(toAppView);
};

const getAppDetail = async (appId) => {
  const app = await database.app.findUnique({
    where: { id: appId },
    include: APP_INCLUDE,
  });
  return toAppView(app);
};

const createApp = (appData) => database.app.create({ data: appData });

const updateApp = async (appId, appData) => {
  const exists = await database.app.findUnique({
    where: { id: appId },
    select: { id: true },
  });
  if (!exists) throw new NotFoundError('应用不存在');
  return database.app.update({ where: { id: appId }, data: appData });
};

const deleteApp = async (appId) => {
  const exists = await database.app.findUnique({
    where: { id: appId },
    select: { id: true },
  });
  if (!exists) throw new NotFoundError('应用不存在');
  await database.app.delete({ where: { id: appId } });
  return true;
};

module.exports = {
  getAllApps,
  getAppsByCategory,
  getAppDetail,
  createApp,
  updateApp,
  deleteApp,
};
