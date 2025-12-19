const express = require("express");
const multer = require("multer");
const { uploadMedia, getMedia, updateMedia, deleteMedia } = require("../controllers/mediaController");
const { verifyToken, checkAdmin } = require("../middlewares/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Public
router.get("/", getMedia);

// Admin only
router.post("/", verifyToken, checkAdmin, upload.single("file"), uploadMedia);
router.put("/:id", verifyToken, checkAdmin, upload.single("file"), updateMedia);
router.delete("/:id", verifyToken, checkAdmin, deleteMedia);

module.exports = router;
