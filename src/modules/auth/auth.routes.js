const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");

router.post("/enroll", authController.enroll);
router.post("/login", authController.login);

module.exports = router;
