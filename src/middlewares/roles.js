const requireTenant = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return res
      .status(403)
      .json({ message: "Tenant context missing in request" });
  }

  // Conveniently attach standard tenant context for valid requests
  req.tenantId = req.user.tenantId;
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

module.exports = {
  requireTenant,
  requireAdmin,
};
