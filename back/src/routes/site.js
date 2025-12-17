const express = require("express");
const { getSite, updateSection } = require("../controllers/siteController");
const { verifyToken, checkAdmin } = require("../middlewares/auth");
const { validateSectionUpdate } = require("../middlewares/validation");

const router = express.Router();

// Public
router.get("/", getSite);

// Admin only
router.patch("/sections/:id", verifyToken, checkAdmin, validateSectionUpdate, updateSection);

module.exports = router;
