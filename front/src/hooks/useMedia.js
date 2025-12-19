import { useState, useEffect } from "react";
import { mediaService } from "../services/api";
import { getMediaUrl } from "../config/api";

export const useMedia = () => {
  const [medias, setMedias] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await mediaService.getMedia();
        // Crée un map mediaId -> media pour accès rapide
        const mediaMap = {};
        data.forEach(media => {
          mediaMap[media.id] = media;
        });
        setMedias(mediaMap);
      } catch (err) {
        console.error("Error loading media:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getMediaUrl = (mediaId) => {
    if (!mediaId || !medias[mediaId]) {
      return null;
    }
    const media = medias[mediaId];
    return media.url; // URL relative "/uploads/..." depuis le backend
  };

  return { medias, getMediaUrl, loading };
};
