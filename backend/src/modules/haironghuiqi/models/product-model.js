const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    institutionId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: '所属机构ID',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '产品名称',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '产品描述',
    },
    maxLoanAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: '最高贷款额度（万元）',
    },
    maxLoanTerm: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '最长贷款期限（年）',
    },
    minAnnualRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '最低年化率（%）',
    },
    applicationConditions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '申请条件',
    },
    processingFlow: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '办理流程',
    },
    requiredDocuments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '所需材料',
    },
    repaymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: '还款方式',
    },
    feeDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '费用说明',
    },
    riskWarning: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '风险提示',
    },
    productFeatures: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '产品特点/优势',
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: '产品标签（数组）',
    },
    keywords: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: '产品关键词（用于智能匹配，数组）',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: '产品状态',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否为明星产品',
    },
  },
  {
    tableName: 'products',
    timestamps: true,
    underscored: true,
    paranoid: true,
    comment: '金融产品表',
  }
);

module.exports = Product;
