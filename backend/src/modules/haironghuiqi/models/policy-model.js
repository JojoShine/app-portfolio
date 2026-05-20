const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Policy = sequelize.define(
  'Policy',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '政策标题',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '政策内容',
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '政策logo URL（minio）',
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '政策链接',
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '发布时间',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
  },
  {
    tableName: 'policies',
    timestamps: true,
    underscored: true,
    comment: '金融政策表',
  }
);

module.exports = Policy;
