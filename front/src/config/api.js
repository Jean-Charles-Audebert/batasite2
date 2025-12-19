/**
 * Configuration centralisée de l'API
 * Utilise des chemins relatifs pour fonctionner partout (dev local, Docker, production)
 */

export const API_CONFIG = {
  // Base URL pour les requêtes API
  // En relatif: / signifie "même domaine, même port"
  // Nginx va proxy /api/* vers le backend
  BASE_URL: "/api",

  // URL complète pour les URLs de médias
  // En relatif: /uploads signifie "même domaine"
  MEDIA_BASE_URL: "/uploads",

  // URL complète pour les redirects (générée côté backend)
  // Utilisée dans les emails, donc doit être absolue
  FRONTEND_BASE_URL: (() => {
    if (typeof window === "undefined") return ""; // SSR
    return `${window.location.protocol}//${window.location.host}`;
  })(),
};

export const getMediaUrl = (mediaPath) => {
  if (!mediaPath) return null;
  // mediaPath est déjà "/uploads/..." depuis le backend
  return mediaPath;
};
