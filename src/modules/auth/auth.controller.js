const authService = require("./auth.service");

const enroll = async (req, res, next) => {
  try {
    const { tenantName, adminName, adminEmail, adminPassword } = req.body;
    if (!tenantName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const result = await authService.enrollTenant({
      tenantName,
      adminName,
      adminEmail,
      adminPassword,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    if (err.message === "Invalid credentials") {
      res.status(401).json({ message: "Invalid credentials" });
    } else {
      next(err);
    }
  }
};

module.exports = {
  enroll,
  login,
};
