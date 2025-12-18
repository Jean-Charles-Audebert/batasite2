import { useState, useEffect } from "react";
import { useSite } from "../hooks/useSite";
import { useMedia } from "../hooks/useMedia";
import { siteService, mediaService } from "../services/api";
import { DragDropList } from "../components/DragDropList";
import { AdminsPage } from "./AdminsPage";
import "./DashboardPage.css";

export const DashboardPage = ({ admin, onLogout }) => {
  const { site, setSite } = useSite();
  const { medias } = useMedia();
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [view, setView] = useState('sections'); // 'sections' or 'admins'

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  const handleSave = async (sectionId, settings, visible) => {
    setLoading(true);
    setMessage(null);

    try {
      await siteService.updateSection(sectionId, settings, visible);
      
      // Update local state and selectedSection
      const updatedSite = {
        ...site,
        sections: site.sections.map((s) =>
          s.id === sectionId
            ? { ...s, settings, visible }
            : s
        ),
      };
      setSite(updatedSite);
      
      // Update selectedSection to the new reference
      const updatedSection = updatedSite.sections.find(s => s.id === sectionId);
      setSelectedSection(updatedSection);

      setMessage({ type: "success", text: "Section mise à jour avec succès!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!site) return <div className="dashboard-loading">Chargement...</div>;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Batala Admin Dashboard</h1>
          <div className="user-info">
            <span>{admin.email} ({admin.role})</span>
            <button onClick={onLogout} className="logout-btn">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <aside className="sections-list">
          <h2>Sections</h2>
          {site.sections?.map((section) => (
            <button
              key={section.id}
              className={`section-btn ${selectedSection?.id === section.id && view === 'sections' ? "active" : ""}`}
              onClick={() => {
                handleSectionClick(section);
                setView('sections');
              }}
            >
              {section.id.charAt(0).toUpperCase() + section.id.slice(1)}
            </button>
          ))}
          
          <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
          
          <button
            className={`section-btn ${view === 'admins' ? "active" : ""}`}
            onClick={() => setView('admins')}
          >
            👥 Admins
          </button>
        </aside>

        <main className="section-editor">
          {view === 'admins' ? (
            <AdminsPage />
          ) : selectedSection ? (
            <SectionEditor
              section={selectedSection}
              onSave={handleSave}
              loading={loading}
              message={message}
              setMessage={setMessage}
              medias={medias}
            />
          ) : (
            <div className="no-selection">
              <p>Sélectionnez une section pour l'éditer</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const SectionEditor = ({ section, onSave, loading, message: msgProp, setMessage, medias }) => {
  const [visible, setVisible] = useState(section.visible);
  
  // Initialize settings with default values based on section type
  const initializeSettings = (settings) => {
    const defaults = {
      text: settings?.text || [],
      events: settings?.events || [],
      images: settings?.images || [],
      videos: settings?.videos || [],
      backgroundMediaId: settings?.backgroundMediaId || null,
      logoMediaId: settings?.logoMediaId || null,
    };
    return { ...defaults, ...settings };
  };
  
  const [settings, setSettings] = useState(initializeSettings(section.settings));
  const [uploading, setUploading] = useState(false);

  // Re-initialize when section changes
  useEffect(() => {
    setVisible(section.visible);
    setSettings(initializeSettings(section.settings));
  }, [section]);

  const handleTextChange = (index, value) => {
    const newText = [...(settings.text || [])];
    newText[index] = value;
    setSettings({ ...settings, text: newText });
  };

  const handleEventChange = (eventId, field, value) => {
    const newEvents = (settings.events || []).map((e) =>
      e.id === eventId ? { ...e, [field]: value } : e
    );
    setSettings({ ...settings, events: newEvents });
  };

  const handleImageChange = (imageId, field, value) => {
    const newImages = (settings.images || []).map((img) =>
      img.id === imageId ? { ...img, [field]: value } : img
    );
    setSettings({ ...settings, images: newImages });
  };

  const handleVideoChange = (videoId, value) => {
    const newVideos = (settings.videos || []).map((v) =>
      v.id === videoId ? { ...v, src: value } : v
    );
    setSettings({ ...settings, videos: newVideos });
  };

  const handleReorderEvents = (oldId, newId) => {
    const events = [...(settings.events || [])];
    const oldIndex = events.findIndex((e) => e.id === oldId);
    const newIndex = events.findIndex((e) => e.id === newId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      [events[oldIndex], events[newIndex]] = [events[newIndex], events[oldIndex]];
      const positionedEvents = events.map((e, i) => ({ ...e, position: i + 1 }));
      setSettings({ ...settings, events: positionedEvents });
    }
  };

  const handleReorderImages = (oldId, newId) => {
    const images = [...(settings.images || [])];
    const oldIndex = images.findIndex((img) => img.id === oldId);
    const newIndex = images.findIndex((img) => img.id === newId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      [images[oldIndex], images[newIndex]] = [images[newIndex], images[oldIndex]];
      const positionedImages = images.map((img, i) => ({ ...img, position: i + 1 }));
      setSettings({ ...settings, images: positionedImages });
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const media = await mediaService.uploadMedia(file);
      
      // Supprimer l'ancien média si présent
      if (field === "backgroundMediaId" && settings.backgroundMediaId) {
        await silentDeleteMedia(settings.backgroundMediaId);
      } else if (field === "logoMediaId" && settings.logoMediaId) {
        await silentDeleteMedia(settings.logoMediaId);
      }
      
      setSettings({ ...settings, [field]: media.id });
      
      setMessage({ type: "success", text: "Média uploadé avec succès!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUploadForEvent = async (e, eventId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const media = await mediaService.uploadMedia(file);
      
      // Supprimer l'ancien média si présent
      const event = (settings.events || []).find((ev) => ev.id === eventId);
      if (event?.mediaId) {
        await silentDeleteMedia(event.mediaId);
      }
      
      const newEvents = (settings.events || []).map((ev) =>
        ev.id === eventId ? { ...ev, mediaId: media.id } : ev
      );
      setSettings({ ...settings, events: newEvents });
      setMessage({ type: "success", text: "Média de l'événement uploadé avec succès!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleFileUploadForImage = async (e, imageId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const media = await mediaService.uploadMedia(file);
      
      // Supprimer l'ancien média si présent
      const image = (settings.images || []).find((img) => img.id === imageId);
      if (image?.mediaId) {
        await silentDeleteMedia(image.mediaId);
      }
      
      const newImages = (settings.images || []).map((img) =>
        img.id === imageId ? { ...img, mediaId: media.id } : img
      );
      setSettings({ ...settings, images: newImages });
      setMessage({ type: "success", text: "Image de la galerie uploadée avec succès!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId, field) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce média?")) return;

    setUploading(true);
    try {
      await mediaService.deleteMedia(mediaId);
      
      if (field === "backgroundMediaId") {
        setSettings({ ...settings, backgroundMediaId: null });
      } else if (field === "logoMediaId") {
        setSettings({ ...settings, logoMediaId: null });
      }
      
      setMessage({ type: "success", text: "Média supprimé avec succès!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const silentDeleteMedia = async (mediaId) => {
    try {
      if (mediaId) {
        await mediaService.deleteMedia(mediaId);
      }
    } catch (err) {
      // Silencieuse - pas de notification
      console.error("Erreur lors de la suppression du média:", err);
    }
  };

  const handleSectionSave = () => {
    onSave(section.id, settings, visible);
  };

  return (
    <div className="editor">
      <h2>{section.id.toUpperCase()}</h2>

      {msgProp && (
        <div className={`message ${msgProp.type}`}>{msgProp.text}</div>
      )}

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={visible}
            onChange={(e) => setVisible(e.target.checked)}
          />
          Visible
        </label>
      </div>

      {/* Hero section */}
      {section.type === "hero" && (
        <div className="hero-section-editor">
          <div className="form-group">
            <label>Image de fond</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "backgroundMediaId")}
              disabled={uploading}
            />
            {settings.backgroundMediaId && (
              <div className="media-info">
                <p>ID: {settings.backgroundMediaId}</p>
                {medias[settings.backgroundMediaId] && (
                  <p>Fichier: {medias[settings.backgroundMediaId].filename}</p>
                )}
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDeleteMedia(settings.backgroundMediaId, "backgroundMediaId")}
                  disabled={uploading}
                  title="Supprimer le média"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "logoMediaId")}
              disabled={uploading}
            />
            {settings.logoMediaId && (
              <div className="media-info">
                <p>ID: {settings.logoMediaId}</p>
                {medias[settings.logoMediaId] && (
                  <p>Fichier: {medias[settings.logoMediaId].filename}</p>
                )}
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDeleteMedia(settings.logoMediaId, "logoMediaId")}
                  disabled={uploading}
                  title="Supprimer le média"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text sections (presentation, mundo) */}
      {(section.type === "presentation" || section.type === "mundo") && (
        <div className="text-section">
          {(settings.text || []).map((text, i) => (
            <div key={i} className="form-group">
              <label>Paragraphe {i + 1}</label>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(i, e.target.value)}
                rows="4"
              />
            </div>
          ))}
        </div>
      )}

      {/* Events section with drag & drop */}
      {section.type === "events" && (
        <div className="events-section">
          <h3>Événements (glisser-déposer pour réordonner)</h3>
          <DragDropList
            items={(settings.events || []).map((e) => ({
              id: e.id,
              children: (
                <div className="event-editor">
                  <h4>{e.title}</h4>
                  <div className="form-group">
                    <label>Titre</label>
                    <input
                      type="text"
                      value={e.title}
                      onChange={(ev) =>
                        handleEventChange(e.id, "title", ev.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={e.description}
                      onChange={(ev) =>
                        handleEventChange(e.id, "description", ev.target.value)
                      }
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(ev) => handleFileUploadForEvent(ev, e.id)}
                      disabled={uploading}
                    />
                    <div className="form-group">
                      <label>Ou sélectionner un média existant:</label>
                      <select
                        value={e.mediaId || ""}
                        onChange={(ev) =>
                          handleEventChange(e.id, "mediaId", ev.target.value ? Number(ev.target.value) : null)
                        }
                      >
                        <option value="">-- Sélectionner --</option>
                        {Object.entries(medias).map(([id, media]) => (
                          <option key={id} value={id}>
                            {media.filename}
                          </option>
                        ))}
                      </select>
                    </div>
                    {e.mediaId && (
                      <div className="media-info">
                        <p>Media ID: {e.mediaId}</p>
                        {medias[e.mediaId] && (
                          <p>Fichier: {medias[e.mediaId].filename}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={e.visible}
                        onChange={(ev) =>
                          handleEventChange(e.id, "visible", ev.target.checked)
                        }
                      />
                      Visible
                    </label>
                  </div>
                </div>
              ),
            }))}
            onReorder={handleReorderEvents}
          />
        </div>
      )}

      {/* Gallery section with drag & drop */}
      {section.type === "gallery" && (
        <div className="gallery-section-editor">
          <h3>Images (glisser-déposer pour réordonner)</h3>
          <DragDropList
            items={(settings.images || []).map((img) => ({
              id: img.id,
              children: (
                <div className="image-editor">
                  <h4>{img.alt}</h4>
                  <div className="form-group">
                    <label>Alt text</label>
                    <input
                      type="text"
                      value={img.alt}
                      onChange={(e) =>
                        handleImageChange(img.id, "alt", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUploadForImage(e, img.id)}
                      disabled={uploading}
                    />
                    {img.mediaId && (
                      <div className="media-info">
                        <p>Media ID: {img.mediaId}</p>
                        {medias[img.mediaId] && (
                          <p>Fichier: {medias[img.mediaId].filename}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={img.visible}
                        onChange={(e) =>
                          handleImageChange(img.id, "visible", e.target.checked)
                        }
                      />
                      Visible
                    </label>
                  </div>
                </div>
              ),
            }))}
            onReorder={handleReorderImages}
          />

          <h3 style={{ marginTop: "2rem" }}>Vidéos YouTube</h3>
          {(settings.videos || []).map((video) => (
            <div key={video.id} className="form-group">
              <label>{video.title} <i className="fa-solid fa-ban" style={{ marginLeft: "0.5rem", color: "#999" }} title="Non supprimable"></i></label>
              <input
                type="text"
                value={video.src}
                onChange={(e) =>
                  handleVideoChange(video.id, e.target.value)
                }
              />
            </div>
          ))}
        </div>
      )}

      <button
        className="save-btn"
        onClick={handleSectionSave}
        disabled={loading || uploading}
      >
        {loading ? "Sauvegarde..." : uploading ? "Upload..." : "Sauvegarder"}
      </button>
    </div>
  );
};
