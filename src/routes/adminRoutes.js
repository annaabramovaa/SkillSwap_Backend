const express = require("express");
const router = express.Router();

const isAuth = require("../middleware/isAuth");
const hasRole = require("../middleware/hasRole");
const adminController = require("../controllers/adminController");

router.get("/users", isAuth, hasRole(["admin"]), adminController.getAllUsers);

router.get("/users/:id", isAuth, hasRole(["admin"]), adminController.getUserById);

router.put("/users/:id", isAuth, hasRole(["admin"]), adminController.updateUser);

router.delete("/users/bulk", isAuth, hasRole(["admin"]), adminController.deleteMultipleUsers);

router.delete("/users/:id", isAuth, hasRole(["admin"]), adminController.deleteUser);

module.exports = router;