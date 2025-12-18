const express = require("express");
const argon2 = require("argon2");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { pool } = require("../config/db");
const router = express.Router();

// Middleware d'authentification
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Non authentifié" });
  }
  
  try {
    const decoded = require("jsonwebtoken").verify(
      token,
      process.env.JWT_SECRET
    );
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

// Configurateur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// GET /api/admins - Lister les admins (sauf superadmin), nécessite authentification
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, role, is_active, created_at FROM admins WHERE role = 'admin' ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/admins - Créer un nouvel admin
router.post("/", requireAuth, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: "Email invalide" });
    }

    // Vérifier que l'email n'existe pas
    const { rows: existing } = await pool.query(
      "SELECT id FROM admins WHERE email = $1",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Cet email existe déjà" });
    }

    // Créer le token de reset
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Insérer l'admin avec is_active = false
    const { rows: newAdmin } = await pool.query(
      `INSERT INTO admins (email, password_hash, role, is_active, password_reset_token, password_reset_expires)
       VALUES ($1, $2, 'admin', false, $3, $4)
       RETURNING id, email`,
      [email, "temp", resetToken, resetExpires]
    );

    // Envoyer l'email d'invitation
    const resetLink = `http://localhost:5173/set-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM_NOREPLY,
      to: email,
      subject: "Invitation - Batala La Rochelle Admin",
      html: `
        <h2>Bienvenue!</h2>
        <p>Vous avez été invité à rejoindre l'administration du site Batala La Rochelle.</p>
        <p><a href="${resetLink}">Définir votre mot de passe</a></p>
        <p>Ce lien expire dans 24 heures.</p>
      `,
    });

    res.status(201).json({
      success: true,
      message: "Admin créé et email d'invitation envoyé",
      admin: newAdmin[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /api/admins/:id/toggle-active - Activer/désactiver un admin
router.patch("/:id/toggle-active", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer l'admin actuel
    const { rows: admin } = await pool.query(
      "SELECT is_active FROM admins WHERE id = $1",
      [id]
    );

    if (!admin.length) {
      return res.status(404).json({ error: "Admin non trouvé" });
    }

    // Inverser is_active
    const { rows: updated } = await pool.query(
      "UPDATE admins SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, is_active",
      [!admin[0].is_active, id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /api/admins/verify-token - Vérifier le token
router.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token manquant" });
    }

    const { rows } = await pool.query(
      "SELECT id, email FROM admins WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP",
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({ error: "Token invalide ou expiré" });
    }

    res.json({ valid: true, admin: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /api/admins/set-password - Définir le password avec token
router.patch("/set-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token et password requis" });
    }

    // Vérifier le token
    const { rows } = await pool.query(
      "SELECT id FROM admins WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP",
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({ error: "Token invalide ou expiré" });
    }

    const adminId = rows[0].id;
    const passwordHash = await argon2.hash(password);

    // Mettre à jour le password et activer l'admin
    await pool.query(
      `UPDATE admins SET 
        password_hash = $1, 
        is_active = true, 
        password_reset_token = NULL,
        password_reset_expires = NULL,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, adminId]
    );

    res.json({ success: true, message: "Password défini avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /api/admins/:id/password - Admin change son password
router.patch("/:id/password", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Vérifier que l'admin ne modifie que son propre password
    if (req.admin.id !== parseInt(id)) {
      return res.status(403).json({ error: "Non autorisé" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Passwords requis" });
    }

    // Récupérer l'admin
    const { rows } = await pool.query(
      "SELECT password_hash FROM admins WHERE id = $1",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Admin non trouvé" });
    }

    // Vérifier l'ancien password
    const valid = await argon2.verify(rows[0].password_hash, currentPassword);
    if (!valid) {
      return res.status(401).json({ error: "Password actuel incorrect" });
    }

    // Hasher le nouveau password
    const newHash = await argon2.hash(newPassword);

    await pool.query(
      "UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [newHash, id]
    );

    res.json({ success: true, message: "Password modifié avec succès" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
