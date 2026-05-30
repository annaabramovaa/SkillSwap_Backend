"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SessionMessage extends Model {
    static associate(models) {
      SessionMessage.belongsTo(models.SessionRequest, {
        foreignKey: "sessionRequestId",
        as: "session",
      });

      SessionMessage.belongsTo(models.User, {
        foreignKey: "senderId",
        as: "sender",
      });
    }
  }

  SessionMessage.init(
    {
      sessionRequestId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SessionMessage",
      timestamps: true,
    },
  );

  return SessionMessage;
};
