const API_URL = "http://localhost:5000/api";

// Helper pour ajouter le token au header
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  console.log("🔐 Token from localStorage:", token ? "✓ Found" : "✗ Not found");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    const res = await fetch(`${API_URL}/site/sections/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      credentials: "include",
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
    const res = await fetch(`${API_URL}/media`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async deleteMedia(id) {
    const res = await fetch(`${API_URL}/media/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: getAuthHeaders(),
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
