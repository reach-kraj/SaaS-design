const express = require("express");
const router = express.Router();
const tasksController = require("./tasks.controller");
const authenticate = require("../../middlewares/auth");
const { requireTenant } = require("../../middlewares/roles");

router.use(authenticate);
router.use(requireTenant);

// Independent task routes
router.put("/:taskId", tasksController.updateTask);
router.delete("/:taskId", tasksController.deleteTask);

module.exports = router;
