const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: '分类名称',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
  },
  {
    tableName: 'categories',
    timestamps: true,
    underscored: true,
    comment: '应用分类表',
  }
);

module.exports = Category;