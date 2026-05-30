const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const messageController = require("../controllers/messageController");

router.use(authMiddleware);

router.post("/:id/messages", messageController.addMessage);

module.exports = router;
