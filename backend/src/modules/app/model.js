const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const App = sequelize.define(
  'App',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '应用名称',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '应用描述',
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '应用图标名称（lucide-react icon）',
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '应用路径',
    },
    status: {
      type: DataTypes.ENUM('active', 'developing', 'offline'),
      defaultValue: 'developing',
      comment: '应用状态',
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '分类ID',
    },
    isScenario: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否为场景化应用（聚合多个应用服务）',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
  },
  {
    tableName: 'apps',
    timestamps: true,
    underscored: true,
    comment: '应用表',
  }
);

// 定义关联关系
const Category = require('./category');
App.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(App, { foreignKey: 'categoryId' });

module.exports = App;

