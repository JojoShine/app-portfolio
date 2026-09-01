const database = require('../../../config/database');
const { NotFoundError } = require('../../../common/utils/error');

const getAllCategories = () => database.category.findMany({
  orderBy: { sort: 'asc' },
});

const createCategory = (categoryData) => database.category.create({ data: categoryData });

const updateCategory = async (categoryId, categoryData) => {
  const exists = await database.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!exists) throw new NotFoundError('分类不存在');
  return database.category.update({ where: { id: categoryId }, data: categoryData });
};

const deleteCategory = async (categoryId) => {
  const exists = await database.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!exists) throw new NotFoundError('分类不存在');
  await database.category.delete({ where: { id: categoryId } });
  return true;
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
