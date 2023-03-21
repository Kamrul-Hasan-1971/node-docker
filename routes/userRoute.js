const express = require("express");

const authController = require("../controllers/authController");

const router = express.Router();

router.post("/signup", authController.signUp);
router.get("/login", authController.login);

module.exports = router;
