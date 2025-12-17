import { useState, useCallback } from "react";

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [admin, setAdmin] = useState(JSON.parse(localStorage.getItem("admin") || "null"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setAuthData = useCallback((newToken, newAdmin) => {
    setToken(newToken);
    setAdmin(newAdmin);
    if (newToken) {
      localStorage.setItem("token", newToken);
      localStorage.setItem("admin", JSON.stringify(newAdmin));
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
    }
  }, []);

  return { token, admin, loading, error, setAuthData, setLoading, setError };
};
