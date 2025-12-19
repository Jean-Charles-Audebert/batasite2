const { pool } = require("../config/db");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

/* ----------------------------------
   Upload Media
---------------------------------- */
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const filename = `${crypto.randomBytes(12).toString("hex")}-${Date.now()}${path.extname(
      req.file.originalname
    )}`;

    const UPLOADS_DIR = "/app/uploads/content";
    const filePath = path.join(UPLOADS_DIR, filename);

    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, req.file.buffer);

    // Determine type
    let type = "image";
    const mimeType = req.file.mimetype;
    if (mimeType.startsWith("video")) type = "video";
    if (mimeType.includes("font")) type = "font";

    // Save to DB
    const { rows } = await pool.query(
      "INSERT INTO media (type, filename, mime_type, size) VALUES ($1, $2, $3, $4) RETURNING *",
      [type, filename, mimeType, req.file.size]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------------------
   Get Media
---------------------------------- */
const getMedia = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM media ORDER BY created_at DESC");
    // Ajoute l'URL complète pour chaque média
    const mediasWithUrl = rows.map(media => ({
      ...media,
      url: `/uploads/content/${media.filename}`
    }));
    res.json(mediasWithUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------------------
   Delete Media
---------------------------------- */
const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query("SELECT filename FROM media WHERE id = $1", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    const filename = rows[0].filename;
    const filePath = path.join(__dirname, "../../uploads/content", filename);

    // Delete file
    try {
      await fs.unlink(filePath);
    } catch {
      // File might not exist, continue anyway
    }

    // Delete from DB
    await pool.query("DELETE FROM media WHERE id = $1", [id]);

    res.json({ message: "Media deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------------------
   Update Media
---------------------------------- */
const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, description } = req.body;

    // Check if replacing file
    if (req.file) {
      // Get old file info
      const { rows: oldRows } = await pool.query("SELECT filename FROM media WHERE id = $1", [id]);
      if (oldRows.length === 0) {
        return res.status(404).json({ error: "Media not found" });
      }

      // Delete old file
      const oldFilename = oldRows[0].filename;
      const oldFilePath = path.join(__dirname, "../../uploads/content", oldFilename);
      try {
        await fs.unlink(oldFilePath);
      } catch {
        // File might not exist, continue anyway
      }

      // Save new file
      const newFilename = `${crypto.randomBytes(12).toString("hex")}-${Date.now()}${path.extname(
        req.file.originalname
      )}`;
      const UPLOADS_DIR = "/app/uploads/content";
      const newFilePath = path.join(UPLOADS_DIR, newFilename);
      await fs.mkdir(path.dirname(newFilePath), { recursive: true });
      await fs.writeFile(newFilePath, req.file.buffer);

      // Update DB with new file
      const { rows } = await pool.query(
        "UPDATE media SET type = $1, filename = $2, mime_type = $3, size = $4 WHERE id = $5 RETURNING *",
        [type || "image", newFilename, req.file.mimetype, req.file.size, id]
      );

      return res.json(rows[0]);
    }

    // Just update metadata
    const { rows } = await pool.query(
      "UPDATE media SET type = $1, title = $2, description = $3 WHERE id = $4 RETURNING *",
      [type || "image", title || null, description || null, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Media not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadMedia,
  getMedia,
  updateMedia,
  deleteMedia,
};
