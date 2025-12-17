import { useState, useEffect } from "react";
import { siteService } from "../services/api";

export const useSite = () => {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await siteService.getSite();
        setSite(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { site, loading, error, setSite };
};
