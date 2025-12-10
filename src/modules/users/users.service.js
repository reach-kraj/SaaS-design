const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const db = require("../../db");

const createUser = async (tenantId, { name, email, password, role }) => {
  // Check if email exists in tenant
  const existing = await db("users")
    .where({ tenant_id: tenantId, email })
    .first();
  if (existing) {
    throw new Error("Email already exists in this tenant");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  await db("users").insert({
    id: userId,
    tenant_id: tenantId,
    name,
    email,
    password_hash: passwordHash,
    role: role || "USER",
  });

  return { id: userId, name, email, role: role || "USER" };
};

const getUsers = async (tenantId) => {
  return await db("users")
    .where({ tenant_id: tenantId })
    .select("id", "name", "email", "role", "created_at");
};

const getUserById = async (tenantId, userId) => {
  return await db("users")
    .where({ tenant_id: tenantId, id: userId })
    .select("id", "name", "email", "role", "created_at")
    .first();
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
};
