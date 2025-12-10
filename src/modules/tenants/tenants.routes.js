const express = require("express");
const router = express.Router();
const db = require("../../db");
const authenticate = require("../../middlewares/auth");
const { requireTenant } = require("../../middlewares/roles");

router.use(authenticate);
router.use(requireTenant);

router.get("/me", async (req, res, next) => {
  try {
    const tenant = await db("tenants").where({ id: req.tenantId }).first();
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.json(tenant);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
