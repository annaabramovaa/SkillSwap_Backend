const express = require("express");
const router = express.Router();

const sessionController = require("../controllers/sessionController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", sessionController.createRequest);

router.get("/", sessionController.getRequests);

router.patch("/:id/accept", sessionController.acceptRequest);

router.patch("/:id/reject", sessionController.rejectRequest);
module.exports = router;
