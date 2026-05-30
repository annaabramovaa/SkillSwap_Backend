"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Skill, {
        through: models.UserTeachSkills,
        foreignKey: "userId",
        otherKey: "skillId",
        as: "teachSkills",
      });

      User.belongsToMany(models.Skill, {
        through: models.UserLearnSkills,
        foreignKey: "userId",
        otherKey: "skillId",
        as: "learnSkills",
      });

      User.hasMany(models.SessionRequest, {
        foreignKey: "requesterId",
        as: "sentRequests",
      });

      User.hasMany(models.SessionRequest, {
        foreignKey: "receiverId",
        as: "receivedRequests",
      });
    }
  }

  User.init(
    {
      name: DataTypes.STRING,

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        defaultValue: "",
      },

      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: true,
      },

      hobbies: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
        allowNull: false,
      },
    },

    {
      sequelize,
      modelName: "User",
      timestamps: true,
    },
  );

  return User;
};
