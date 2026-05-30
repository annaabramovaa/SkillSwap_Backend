const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post("/register", userController.register);
router.post("/login", userController.login);

router.get("/me", authMiddleware, userController.getMe);
router.patch("/me", authMiddleware, userController.updateMe);

router.get("/", authMiddleware, userController.getAllUsers);

router.get("/dashboard", authMiddleware, userController.getDashboard);

router.get("/matches", authMiddleware, userController.getMatches);


router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  userController.uploadAvatar,
);

router.delete("/avatar", authMiddleware, userController.deleteAvatar);

module.exports = router;
