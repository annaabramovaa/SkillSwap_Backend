"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SessionRequest extends Model {
    static associate(models) {
      SessionRequest.belongsTo(models.User, {
        foreignKey: "requesterId",
        as: "requester",
      });

      SessionRequest.belongsTo(models.User, {
        foreignKey: "receiverId",
        as: "receiver",
      });

      SessionRequest.hasMany(models.SessionMessage, {
        foreignKey: "sessionRequestId",
        as: "messages",
      });
    }
  }

  SessionRequest.init(
    {
      requesterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      requesterApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      receiverApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      status: {
        type: DataTypes.ENUM("pending", "accepted", "rejected", "cancelled"),
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "SessionRequest",
      timestamps: true,
    },
  );

  return SessionRequest;
};
