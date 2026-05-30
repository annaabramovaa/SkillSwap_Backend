const { Op } = require("sequelize");
const { User } = require("../models");

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const { search, id } = req.query;

    let where = {};

    where.id = { [Op.ne]: req.user.id };

    if (id) {
      where.id = id;
    } else if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]],
    });

    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET ONE USER
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({
      role: role ?? user.role,
    });

    const updated = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
    });

    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE ONE USER
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DELETE MULTIPLE USERS (bulk)
exports.deleteMultipleUsers = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No user IDs provided" });
    }

    if (ids.includes(req.user.id)) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await User.destroy({
      where: { id: { [Op.in]: ids } },
    });

    res.json({ message: `Deleted ${ids.length} users` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
