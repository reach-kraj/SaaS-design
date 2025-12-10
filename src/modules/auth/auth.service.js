const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const db = require("../../db");
const { generateToken } = require("../../utils/jwt");

const enrollTenant = async ({
  tenantName,
  adminName,
  adminEmail,
  adminPassword,
}) => {
  return await db.transaction(async (trx) => {
    // 1. Create Tenant
    const tenantId = uuidv4();
    await trx("tenants").insert({
      id: tenantId,
      name: tenantName,
    });

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // 3. Create Admin User
    const userId = uuidv4();
    await trx("users").insert({
      id: userId,
      tenant_id: tenantId,
      name: adminName,
      email: adminEmail,
      password_hash: passwordHash,
      role: "ADMIN",
    });

    // 4. Generate Token (optional, but convenient)
    const token = generateToken({
      userId,
      tenantId,
      role: "ADMIN",
    });

    return {
      tenant: { id: tenantId, name: tenantName },
      user: { id: userId, name: adminName, email: adminEmail, role: "ADMIN" },
      token,
    };
  });
};

const login = async ({ email, password }) => {
  const user = await db("users").where({ email }).first();

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    userId: user.id,
    tenantId: user.tenant_id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    },
  };
};

module.exports = {
  enrollTenant,
  login,
};
