"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Skill extends Model {
    static associate(models) {
      Skill.belongsToMany(models.User, {
        through: "UserTeachSkills",
        as: "teachers",
        foreignKey: "skillId",
      });

      Skill.belongsToMany(models.User, {
        through: "UserLearnSkills",
        as: "learners",
        foreignKey: "skillId",
      });
    }
  }

  Skill.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "Skill",
      timestamps: true,
    },
  );

  return Skill;
};
