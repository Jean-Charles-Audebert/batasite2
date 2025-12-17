const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/db");

/* ----------------------------------
   Login
---------------------------------- */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const { rows } = await pool.query(
      "SELECT id, email, password_hash, role, is_active FROM admins WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = rows[0];

    if (!admin.is_active) {
      return res.status(401).json({ error: "Account disabled" });
    }

    // Verify password
    const passwordMatch = await argon2.verify(admin.password_hash, password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );

    // Set refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ----------------------------------
   Refresh Token
---------------------------------- */
const refreshTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
};

/* ----------------------------------
   Logout
---------------------------------- */
const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

module.exports = {
  login,
  refreshTokenHandler,
  logout,
};
