module.exports = (sequelize, DataTypes) => {
  const Share = sequelize.define('Share', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sharedWith: {
      type: DataTypes.STRING, // email of the user
      allowNull: false,
    },
    permission: {
      type: DataTypes.STRING, // e.g., 'read', 'write'
      defaultValue: 'read',
    },
  });

  Share.associate = (models) => {
    Share.belongsTo(models.File, { foreignKey: 'fileId' });
  };

  return Share;
};
