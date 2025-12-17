const { pool } = require("../config/db");

/* ----------------------------------
   Get Site Content
---------------------------------- */
const getSite = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT meta, theme, sections FROM site");

    if (rows.length === 0) {
      return res.status(404).json({ error: "Site not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------------------
   Update Section
---------------------------------- */
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { settings, visible } = req.body;

    const { rows: siteRows } = await pool.query("SELECT sections FROM site");
    if (siteRows.length === 0) {
      return res.status(404).json({ error: "Site not found" });
    }

    const sections = siteRows[0].sections;
    const sectionIndex = sections.findIndex((s) => s.id === id);

    if (sectionIndex === -1) {
      return res.status(404).json({ error: "Section not found" });
    }

    if (settings) sections[sectionIndex].settings = settings;
    if (visible !== undefined) sections[sectionIndex].visible = visible;

    await pool.query("UPDATE site SET sections = $1::jsonb, updated_at = CURRENT_TIMESTAMP", [JSON.stringify(sections)]);

    res.json(sections[sectionIndex]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSite,
  updateSection,
};
