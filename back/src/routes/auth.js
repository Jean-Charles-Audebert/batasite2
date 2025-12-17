const express = require("express");
const { login, refreshTokenHandler, logout } = require("../controllers/authController");
const { validateLogin } = require("../middlewares/validation");

const router = express.Router();

router.post("/login", validateLogin, login);
router.post("/refresh", refreshTokenHandler);
router.post("/logout", logout);

module.exports = router;
