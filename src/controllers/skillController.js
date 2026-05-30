const { Skill, User } = require("../models");
const { Op } = require("sequelize");

// CREATE SKILL
exports.createSkill = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Name required" });

    const skill = await Skill.findOne({ where: { name } });

    if (skill) {
      return res.status(400).json({ message: "Skill already exists" });
    }

    const newSkill = await Skill.create({
      name: name.trim(),
    });

    res.status(201).json(newSkill);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET ALL SKILLS
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll();
    res.json(skills);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// AUTOCOMPLETE SKILLS
exports.searchSkills = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) return res.json([]);

    const skills = await Skill.findAll({
      where: {
        name: {
          [Op.iLike]: `${query}%`,
        },
      },
      limit: 10,
    });

    res.json(skills);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET MY SKILLS
exports.getMySkills = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: ["teachSkills", "learnSkills"],
    });

    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ADD LEARN SKILL
exports.addLearnSkill = async (req, res) => {
  try {
    const { skillId } = req.body;

    const user = await User.findByPk(req.user.id);
    await user.addLearnSkill(skillId);

    res.json({ message: "Added learn skill" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ADD TEACH SKILL
exports.addTeachSkill = async (req, res) => {
  try {
    const { skillId } = req.body;

    const user = await User.findByPk(req.user.id);
    await user.addTeachSkill(skillId);

    res.json({ message: "Added teach skill" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// REMOVE LEARN SKILL
exports.removeLearnSkill = async (req, res) => {
  try {
    const { skillId } = req.body;

    const user = await User.findByPk(req.user.id);
    await user.removeLearnSkill(skillId);

    res.json({ message: "Removed learn skill" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// REMOVE TEACH SKILL
exports.removeTeachSkill = async (req, res) => {
  try {
    const { skillId } = req.body;

    const user = await User.findByPk(req.user.id);
    await user.removeTeachSkill(skillId);

    res.json({ message: "Removed teach skill" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
