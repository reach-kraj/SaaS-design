const express = require("express");
const router = express.Router();
const db = require("../../db");
const authenticate = require("../../middlewares/auth");
const { requireTenant } = require("../../middlewares/roles");
const { v4: uuidv4 } = require("uuid");

router.use(authenticate);
router.use(requireTenant);

// GET /api/projects
router.get("/", async (req, res, next) => {
  try {
    const projects = await db("projects").where({ tenant_id: req.tenantId });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects
router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const id = uuidv4();
    await db("projects").insert({
      id,
      tenant_id: req.tenantId,
      name,
      description,
    });

    const project = await db("projects").where({ id }).first();
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id
router.get("/:id", async (req, res, next) => {
  try {
    const project = await db("projects")
      .where({ id: req.params.id, tenant_id: req.tenantId })
      .first();

    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const count = await db("projects")
      .where({ id: req.params.id, tenant_id: req.tenantId })
      .update({ name, description, updated_at: db.fn.now() });

    if (!count) return res.status(404).json({ message: "Project not found" });

    const project = await db("projects").where({ id: req.params.id }).first();
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const count = await db("projects")
      .where({ id: req.params.id, tenant_id: req.tenantId })
      .del();

    if (!count) return res.status(404).json({ message: "Project not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Nested Tasks Routes
const tasksController = require("../tasks/tasks.controller");
router.post("/:projectId/tasks", tasksController.createTask);
router.get("/:projectId/tasks", tasksController.getProjectTasks);

module.exports = router;
