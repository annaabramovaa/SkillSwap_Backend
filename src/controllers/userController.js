const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, SessionRequest } = require("../models");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const result = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
    });

    return res.status(201).json(result);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET ME
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE ME (only basic profile)
exports.updateMe = async (req, res) => {
  try {
    const { name, description, location, gender, hobbies } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      name: name ?? user.name,
      description: description ?? user.description,
      location: location ?? user.location,
      gender: gender ?? user.gender,
      hobbies: hobbies ?? user.hobbies,
    });

    const updated = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const received = await SessionRequest.findAll({
      where: { receiverId: req.user.id },
    });

    const sent = await SessionRequest.findAll({
      where: { requesterId: req.user.id },
    });

    res.json({
      user,
      stats: {
        receivedRequests: received.length,
        sentRequests: sent.length,
      },
      received,
      sent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MATCHES
exports.getMatches = async (req, res) => {
  try {
    const { location, gender, hobbies, skill } = req.query;

    const currentUser = await User.findByPk(req.user.id, {
      include: ["teachSkills", "learnSkills"],
    });

    const myTeachIds = currentUser.teachSkills.map((s) => s.id);
    const myLearnIds = currentUser.learnSkills.map((s) => s.id);

    const hasFilters = location || gender || hobbies;

    let where = {
      id: { [Op.ne]: req.user.id },
    };

    if (gender) where.gender = gender;
    if (location) where.location = location;

    let users = await User.findAll({
      where,
      include: ["teachSkills", "learnSkills"],
    });

    if (hobbies) {
      const hobbiesArr = hobbies
        .toLowerCase()
        .split(",")
        .map((h) => h.trim());

      users = users.filter((user) => {
        const userHobbies = Array.isArray(user.hobbies) ? user.hobbies : [];

        return userHobbies.some((h) => hobbiesArr.includes(h.toLowerCase()));
      });
    }

    if (skill) {
      users = users.filter((user) => {
        const allSkills = [...user.teachSkills, ...user.learnSkills];

        return allSkills.some((s) =>
          s.name.toLowerCase().includes(skill.toLowerCase()),
        );
      });
    }

    const matches = users.filter((user) => {
      const userTeachIds = user.teachSkills.map((s) => s.id);
      const userLearnIds = user.learnSkills.map((s) => s.id);

      const canTeachMe = userTeachIds.some((id) => myLearnIds.includes(id));

      const learnsFromMe = userLearnIds.some((id) => myTeachIds.includes(id));

      return canTeachMe && learnsFromMe;
    });

    return res.json(matches);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const avatarUrl = req.file.path;

    await user.update({ avatar: avatarUrl });
    res.json({ avatar: avatarUrl });
  } catch (e) {
    console.error("uploadAvatar error:", e);
    res.status(500).json({ message: e.message });
  }
};

exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      const cloudinary = require("../config/cloudinary");
      await cloudinary.uploader.destroy(`avatars/${publicId}`);
    }

    await user.update({ avatar: null });
    res.json({ message: "Avatar deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
