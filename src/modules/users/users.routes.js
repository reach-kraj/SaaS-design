const express = require("express");
const router = express.Router();
const userService = require("./users.service");
const authenticate = require("../../middlewares/auth");
const { requireTenant, requireAdmin } = require("../../middlewares/roles");

router.use(authenticate);
router.use(requireTenant);

// Get current user profile
router.get("/me", async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.tenantId, req.user.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// Admin routes below
router.use(requireAdmin);

router.post("/", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const newUser = await userService.createUser(req.tenantId, {
      name,
      email,
      password,
      role,
    });
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.tenantId);
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
