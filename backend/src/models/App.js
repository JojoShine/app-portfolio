const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
      sort: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '排序',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'apps',
      timestamps: true,
      comment: '应用表',
    }
  );

  return App;
};
