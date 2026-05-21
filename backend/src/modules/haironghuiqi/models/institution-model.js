const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Institution = sequelize.define(
  'Institution',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '机构名称',
    },
    category: {
      type: DataTypes.ENUM('bank', 'insurance', 'securities', 'other'),
      allowNull: false,
      comment: '机构分类',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '机构地址',
    },
    businessHours: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '营业时间',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '联系电话',
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '机构logo URL（minio）',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '机构描述',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: '机构状态',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
  },
  {
    tableName: 'institutions',
    timestamps: true,
    underscored: true,
    comment: '金融机构表',
  }
);

module.exports = Institution;
