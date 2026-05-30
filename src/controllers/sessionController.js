const { SessionRequest, SessionMessage, User } = require("../models");

// CREATE REQUEST
exports.createRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({
        message: "receiverId and message are required",
      });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({
        message: "You cannot send request to yourself",
      });
    }

    const existingRequest = await SessionRequest.findOne({
      where: {
        requesterId: req.user.id,
        receiverId,
        status: "pending",
      },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Request already exists",
      });
    }

    const request = await SessionRequest.create({
      requesterId: req.user.id,
      receiverId,
      requesterApproved: true,
      receiverApproved: false,
      status: "pending",
    });

    await SessionMessage.create({
      sessionRequestId: request.id,
      senderId: req.user.id,
      message,
    });

    const fullRequest = await SessionRequest.findByPk(request.id, {
      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name", "email"],
        },
        {
          model: SessionMessage,
          as: "messages",
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    res.status(201).json(fullRequest);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL MY REQUESTS
exports.getRequests = async (req, res) => {
  try {
    const requests = await SessionRequest.findAll({
      where: {
        receiverId: req.user.id,
      },

      include: [
        {
          model: User,
          as: "requester",
          attributes: ["id", "name", "email"],
        },

        {
          model: SessionMessage,
          as: "messages",

          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "name"],
            },
          ],

          order: [["createdAt", "ASC"]],
        },
      ],

      order: [["createdAt", "DESC"]],
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ACCEPT REQUEST
exports.acceptRequest = async (req, res) => {
  try {
    const request = await SessionRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.receiverId !== req.user.id) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    request.receiverApproved = true;

    if (request.requesterApproved && request.receiverApproved) {
      request.status = "accepted";
    }

    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REJECT REQUEST
exports.rejectRequest = async (req, res) => {
  try {
    const request = await SessionRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.receiverId !== req.user.id) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    request.status = "rejected";

    await request.save();

    res.json({
      message: "Request rejected",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE SESSION (ONLY REQUESTER)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await SessionRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.requesterId !== req.user.id) {
      return res.status(403).json({
        message: "Only requester can delete session",
      });
    }

    await request.destroy();

    res.json({
      message: "Session deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADD MESSAGE
exports.addMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const request = await SessionRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const isParticipant =
      request.requesterId === req.user.id || request.receiverId === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    const newMessage = await SessionMessage.create({
      sessionRequestId: request.id,
      senderId: req.user.id,
      message,
    });

    const fullMessage = await SessionMessage.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json(fullMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
