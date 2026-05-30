module.exports = (sequelize, DataTypes) => {
  const UserTeachSkills = sequelize.define(
    "UserTeachSkills",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      skillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Skills",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "UserTeachSkills",
      timestamps: false,
    },
  );

  UserTeachSkills.associate = (models) => {
    UserTeachSkills.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    UserTeachSkills.belongsTo(models.Skill, {
      foreignKey: "skillId",
      as: "skill",
    });
  };

  return UserTeachSkills;
};
