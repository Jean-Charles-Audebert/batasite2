import { API_CONFIG } from "../config/api";

const API_URL = API_CONFIG.BASE_URL;

// Helper pour ajouter le token au header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log("🔐 Token from localStorage:", token ? "✓ Found" : "✗ Not found");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Wrapper fetch avec gestion automatique du refresh token et redirection login
export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    ...options.headers,
    ...getAuthHeaders(),
  };

  let res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Si 401, tenter un refresh et réessayer
  if (res.status === 401) {
    try {
      // Tenter le refresh
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const { token } = await refreshRes.json();
        localStorage.setItem("token", token);

        // Réessayer l'appel original avec le nouveau token
        const newHeaders = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };

        res = await fetch(url, {
          ...options,
          headers: newHeaders,
          credentials: "include",
        });
      } else {
        // Refresh échoué, rediriger vers login
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Session expired, redirecting to login");
      }
    } catch (err) {
      // Erreur de refresh, rediriger vers login
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Session expired, redirecting to login");
    }
  }

  return res;
};

/* ----------------------------------
   Auth Service
---------------------------------- */
export const authService = {
  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async refresh() {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async logout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },
};

/* ----------------------------------
   Site Service
---------------------------------- */
export const siteService = {
  async getSite() {
    const res = await fetch(`${API_URL}/site`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async updateSection(id, settings, visible) {
    const res = await fetchWithAuth(`${API_URL}/site/sections/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings, visible }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

/* ----------------------------------
   Media Service
---------------------------------- */
export const mediaService = {
  async getMedia() {
    const res = await fetch(`${API_URL}/media`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async uploadMedia(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetchWithAuth(`${API_URL}/media`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async deleteMedia(id) {
    const res = await fetchWithAuth(`${API_URL}/media/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

/* ----------------------------------
   Contact Service
---------------------------------- */
export const contactService = {
  async sendContactMessage(name, email, message) {
    const res = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

/* ----------------------------------
   Admins Service
---------------------------------- */
export const adminsService = {
  async getAdmins() {
    const res = await fetchWithAuth(`${API_URL}/admins`, {
      method: "GET",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async createAdmin(email) {
    const res = await fetchWithAuth(`${API_URL}/admins`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async toggleAdminActive(id) {
    const res = await fetchWithAuth(`${API_URL}/admins/${id}/toggle-active`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async verifyToken(token) {
    const res = await fetch(`${API_URL}/admins/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async setPassword(token, password) {
    const res = await fetch(`${API_URL}/admins/set-password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async changePassword(adminId, currentPassword, newPassword) {
    const res = await fetchWithAuth(`${API_URL}/admins/${adminId}/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
