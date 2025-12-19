/**
 * Configuration centralisée du backend
 */

// Environnements supportés
const ENVIRONMENTS = {
  development: "development",
  production: "production",
  docker: "docker",
};

const NODE_ENV = process.env.NODE_ENV || "development";

// URLs autorisées pour CORS
const getCorsOrigins = () => {
  if (NODE_ENV === "docker" || NODE_ENV === "production") {
    return [
      "https://batasite2.jc1932.synology.me",
      "http://localhost:5180", // Frontend Docker sur le NAS
      "http://frontend", // Service Docker
    ];
  }

  // Development local
  return [
    "http://localhost:5173", // Vite dev server
    "http://localhost:3000", // Alternative dev
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://batasite2.jc1932.synology.me",
  ];
};

// URL du frontend pour les redirects (emails, etc.)
const getFrontendUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }

  if (NODE_ENV === "docker" || NODE_ENV === "production") {
    return "https://batasite2.jc1932.synology.me";
  }

  return "http://localhost:5173"; // Default dev
};

module.exports = {
  NODE_ENV,
  ENVIRONMENTS,
  corsOrigins: getCorsOrigins(),
  frontendUrl: getFrontendUrl(),
};
