const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

/**
 * 申请模型
 */
const Application = sequelize.define(
  'Application',
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
    },
    institutionId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '机构ID',
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '产品ID',
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '用户姓名',
    },
    userPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '用户手机号',
    },
    userIdCard: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '用户身份证号',
    },
    userWorkUnit: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '用户工作单位',
    },
    applicationType: {
      type: DataTypes.STRING,
      defaultValue: 'apply',
      comment: '申请类型（apply/consult）',
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
      comment: '申请状态（pending/submitted/approved/rejected）',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
      comment: '备注',
    },
    requirementDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
      comment: '需求说明',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序字段（升序）',
    },
  },
  {
    tableName: 'applications',
    timestamps: true,
    underscored: true,
    paranoid: true,
    comment: '申请表',
  }
);

// 定义关联关系
Application.associate = (models) => {
  Application.belongsTo(models.Institution, {
    foreignKey: 'institutionId',
    as: 'Institution',
  });
  Application.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'Product',
  });
};

module.exports = Application;
