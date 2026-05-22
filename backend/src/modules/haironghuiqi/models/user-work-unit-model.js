const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

/**
 * 用户工作单位关联模型
 */
const UserWorkUnit = sequelize.define(
  'UserWorkUnit',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '用户ID',
      unique: true,
    },
    workUnit: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '工作单位',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序字段（升序）',
    },
  },
  {
    tableName: 'user_work_units',
    timestamps: true,
    underscored: true,
    paranoid: true,
    comment: '用户工作单位关联表',
  }
);

module.exports = UserWorkUnit;
