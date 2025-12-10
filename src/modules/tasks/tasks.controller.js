const express = require("express");
const router = express.Router({ mergeParams: true }); // Important for accessing :projectId if nested, but here we might not nest routes deeply yet.
const db = require("../../db");
const authenticate = require("../../middlewares/auth");
const { requireTenant } = require("../../middlewares/roles");
const { v4: uuidv4 } = require("uuid");

router.use(authenticate);
router.use(requireTenant);

// Tasks often sit under projects, but top level access is also useful.
// User requested: POST /api/projects/:projectId/tasks
// So we will likely mount this router or handle it appropriately.
// Let's assume standard routes first, and we can handle nested in app.js or here.

// But wait, the prompt asked for:
// - POST /api/projects/:projectId/tasks
// - GET /api/projects/:projectId/tasks
// - PUT /api/tasks/:taskId
// - DELETE /api/tasks/:taskId

// I will implement a general tasks router, but maybe I should split "project tasks" vs "tasks".
// Actually, I can use a single router and check params.

// Helper to verify project belongs to tenant
const verifyProject = async (tenantId, projectId) => {
  const project = await db("projects")
    .where({ id: projectId, tenant_id: tenantId })
    .first();
  return !!project;
};

// GET /api/projects/:projectId/tasks
// We will export a handler or router.
// If I mount this at /api/tasks, I can't easily capture /api/projects/:projectId/tasks unless I mount it there too.
// I will create simple handlers and export them to be used in the Projects router or a separate Tasks router.

// Simpler: Just put the nested routes in the Projects router? No, separate modules is cleaner.
// I'll create a Tasks router that handles:
// POST / (with projectId in body or params? Prompt says /api/projects/:projectId/tasks)
// So I will modify projects.routes.js to mount tasks router? Or just handle it there?
// "Mounting" is best. `router.use('/:projectId/tasks', tasksRouter)`

// Let's define the Tasks router to handle `/` (which becomes `/:projectId/tasks` when mounted)
// AND `/` global? No, specific requirements.

// Wait, the prompt also asks for `PUT /api/tasks/:taskId`. Use `/api/tasks` for that?
// So we need two mount points:
// 1. `/api/projects/:projectId/tasks` -> GET, POST
// 2. `/api/tasks` -> PUT, DELETE

// I'll implement logic in `tasks.routes.js` and might mount it twice or handle differently.
// Actually, `tasks.routes.js` can handle both if I structure it well, or I'll just use `/api/tasks` for everything and pass projectId in query/body?
// Re-reading:
// "POST /api/projects/:projectId/tasks"
// "PUT /api/tasks/:taskId"

// Okay, I will modify `projects.routes.js` to handle the nested routes, imports from a `tasks.controller.js`.
// And create `tasks.routes.js` for the top-level `/api/tasks` routes.
// OR: Just put it all in `tasks.routes.js` and mount it at `/api`.
// router.post('/projects/:projectId/tasks', ...)
// router.put('/tasks/:taskId', ...)
// This is cleaner for the route file but less RESTful strictness on file structure.
// I'll go with `src/modules/tasks/tasks.routes.js` defining ALL task related routes starting from root if I mount at `/api`.
// But `app.js` usually mounts `app.use('/api/projects', projectsRoutes)`.

// Strategy:
// 1. `projects.routes.js` handles `/api/projects` and nested `/api/projects/:projectId/tasks`.
// 2. `tasks.routes.js` handles `/api/tasks` and independent operations.
// Ideally, keeping code in `tasks.controller` is best.

const tasksController = {
  createTask: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const { title, status } = req.body;

      // Verify project ownership
      const project = await db("projects")
        .where({ id: projectId, tenant_id: req.tenantId })
        .first();
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      // Create Task
      const id = uuidv4();
      await db("tasks").insert({
        id,
        tenant_id: req.tenantId,
        project_id: projectId,
        title,
        status: status || "TODO",
      });

      const task = await db("tasks").where({ id }).first();
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  getProjectTasks: async (req, res, next) => {
    try {
      const { projectId } = req.params;
      // Verify project ownership (implicit in join or query, but explicit is safer)
      const project = await db("projects")
        .where({ id: projectId, tenant_id: req.tenantId })
        .first();
      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const tasks = await db("tasks").where({
        project_id: projectId,
        tenant_id: req.tenantId,
      });
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  },

  updateTask: async (req, res, next) => {
    try {
      const { taskId } = req.params;
      const { title, status } = req.body;

      // Ensure task belongs to tenant
      const count = await db("tasks")
        .where({ id: taskId, tenant_id: req.tenantId })
        .update({ title, status, updated_at: db.fn.now() });

      if (!count) return res.status(404).json({ message: "Task not found" });

      const task = await db("tasks").where({ id: taskId }).first();
      res.json(task);
    } catch (err) {
      next(err);
    }
  },

  deleteTask: async (req, res, next) => {
    try {
      const { taskId } = req.params;
      const count = await db("tasks")
        .where({ id: taskId, tenant_id: req.tenantId })
        .del();

      if (!count) return res.status(404).json({ message: "Task not found" });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

module.exports = tasksController;
