module.exports = (sequelize, DataTypes) => {
  const UserLearnSkills = sequelize.define(
    "UserLearnSkills",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      skillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Skills",
          key: "id",
        },
      },
    },
    {
      tableName: "UserLearnSkills",
      timestamps: false,
    },
  );

  UserLearnSkills.associate = (models) => {
    UserLearnSkills.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    UserLearnSkills.belongsTo(models.Skill, {
      foreignKey: "skillId",
      as: "skill",
    });
  };

  return UserLearnSkills;
};
