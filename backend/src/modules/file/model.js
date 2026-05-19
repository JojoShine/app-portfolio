const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const File = sequelize.define(
  'File',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    fileType: {
      type: DataTypes.ENUM('image', 'document', 'video', 'audio', 'other'),
      defaultValue: 'other',
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'files',
    timestamps: true,
    underscored: true,
  }
);

module.exports = File;