const jwt = require("jsonwebtoken");

/* ----------------------------------
   Verify JWT Token
---------------------------------- */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/* ----------------------------------
   Check admin role
---------------------------------- */
const checkAdmin = (req, res, next) => {
  if (!req.user || !["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/* ----------------------------------
   Check superadmin role
---------------------------------- */
const checkSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Superadmin access required" });
  }
  next();
};

module.exports = {
  verifyToken,
  checkAdmin,
  checkSuperAdmin,
};
