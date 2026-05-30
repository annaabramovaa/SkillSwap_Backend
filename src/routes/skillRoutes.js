const express = require("express");
const router = express.Router();

const skillController = require("../controllers/skillController");
const authMiddleware = require("../middleware/authMiddleware");

// SKILLS CRUD
router.post("/", authMiddleware, skillController.createSkill);
router.get("/", skillController.getAllSkills);

router.get("/search", skillController.searchSkills);

// USER SKILLS
router.get("/me", authMiddleware, skillController.getMySkills);

router.post("/learn", authMiddleware, skillController.addLearnSkill);
router.post("/teach", authMiddleware, skillController.addTeachSkill);

router.delete("/learn", authMiddleware, skillController.removeLearnSkill);
router.delete("/teach", authMiddleware, skillController.removeTeachSkill);

module.exports = router;
