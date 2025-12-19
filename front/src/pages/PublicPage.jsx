import { useSite } from "../hooks/useSite";
import { useMedia } from "../hooks/useMedia";
import { useState, useEffect } from "react";
import { contactService } from "../services/api";
import "./PublicPage.css";

// Convertir n'importe quel format YouTube en URL embed (sans trackers)
const convertToEmbedUrl = (url) => {
  if (!url) return "";
  
  // Si c'est déjà une URL embed nocookie, retourner telle quelle
  if (url.includes("youtube-nocookie.com/embed/")) return url;
  
  // Si c'est une URL embed normale, la convertir en nocookie
  if (url.includes("youtube.com/embed/")) {
    return url.replace("youtube.com/embed/", "youtube-nocookie.com/embed/");
  }
  
  // Format: https://youtu.be/VIDEO_ID
  const youtubeShortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtubeShortMatch) {
    return `https://www.youtube-nocookie.com/embed/${youtubeShortMatch[1]}`;
  }
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const youtubeMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}`;
  }
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID&...
  const youtubeWithParamsMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (youtubeWithParamsMatch) {
    return `https://www.youtube-nocookie.com/embed/${youtubeWithParamsMatch[1]}`;
  }
  
  // Si aucun match, retourner l'URL originale (peut-être qu'elle est déjà correcte)
  return url;
};

export const PublicPage = () => {
  const { site, loading, error } = useSite();
  const { getMediaUrl } = useMedia();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState("");

  useEffect(() => {
    // État du modal synchronisé
  }, [isContactOpen]);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;
  if (!site) return <div className="error">Aucun contenu disponible</div>;

  const openContactModal = (e) => {
    e.preventDefault();
    setIsContactOpen(true);
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactMessage("");

    try {
      await contactService.sendContactMessage(
        contactForm.name,
        contactForm.email,
        contactForm.message
      );

      setContactMessage("✅ Message envoyé avec succès!");
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => {
        setIsContactOpen(false);
        setContactMessage("");
      }, 2000);
    } catch (error) {
      console.error("Erreur:", error);
      setContactMessage(`❌ ${error.message}`);
    } finally {
      setContactLoading(false);
    }
  };

  const sections = site.sections || [];

  return (
    <div className="public-page">
      {/* Render sections dynamically */}
      {sections.map((section) => {
        if (!section.visible) return null;

        switch (section.type) {
          case "hero":
            return (
              <section key={section.id} className="section hero-section">
                <div
                  className="hero-background"
                  style={{
                    backgroundImage: section.settings.backgroundMediaId
                      ? `url(${getMediaUrl(
                          section.settings.backgroundMediaId
                        )})`
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="hero-overlay" />
                  <div className="hero-content">
                    {section.settings.logoMediaId && (
                      <img
                        src={getMediaUrl(section.settings.logoMediaId)}
                        alt="Logo Batala"
                        className="hero-logo"
                      />
                    )}

                    <nav className="hero-nav">
                      <a href="#events" className="nav_link">
                        Agenda
                      </a>
                      <a href="#mundo" className="nav_link">
                        Mundo
                      </a>
                      <a href="#gallery" className="nav_link">
                        Photos
                      </a>
                      <button
                        className="nav_link" id="contact-button"
                        onClick={() => setIsContactOpen(true)}
                      >
                        Contact
                      </button>
                    </nav>
                    <nav className="hero-social">
                      <a
                        href="https://www.facebook.com/batalalarochelle"
                        className="social_link"
                        aria-label="Lien vers la page Facebook de Batala La Rochelle"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa-brands fa-facebook"></i>
                      </a>
                      <a
                        href="https://www.instagram.com/batalalarochelle"
                        className="social_link"
                        aria-label="Lien vers le compte Instagram de Batala La Rochelle"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa-brands fa-instagram"></i>
                      </a>
                      <a
                        href="https://www.youtube.com/channel/UC2nkR0cyMLRxYs1yk1ktHgQ"
                        className="social_link"
                        aria-label="Lien vers la chaîne YouTube de Batala La Rochelle"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fa-brands fa-youtube"></i>
                      </a>
                    </nav>
                  </div>
                </div>
              </section>
            );

          case "presentation":
            return (
              <>
                <section
                  key={section.id}
                  className="section presentation-section"
                >
                  <div className="container">
                    <img
                      className="presentation-img"
                      src="/pres_deco.png"
                      alt="Présentation de Batala"
                    />
                    {/* <h2>Qui sommes-nous ?</h2> */}
                    <div className="text-content">
                      <h2>Batala La Rochelle</h2>
                      {section.settings.text?.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                </section>
                <section
                  className="separator pres-bg"
                  role="presentation"
                  aria-hidden="true"
                >
                  <img src="/FOOTER.svg" alt="Décoration présentation" />
                </section>
              </>
            );

          case "events":
            return (
              <>
                <section
                  key={section.id}
                  className="section events-section"
                  id="events"
                >
                  <div className="container">
                    <h2>Événements</h2>
                    <div className="events-grid">
                      {section.settings.events?.map(
                        (event) =>
                          event.visible && (
                            <div key={event.id} className="event-card">
                              {event.mediaId && (
                                <img
                                  src={getMediaUrl(event.mediaId)}
                                  alt={event.title}
                                  className="event-image"
                                />
                              )}
                              <h3>{event.title}</h3>
                              <p>{event.description}</p>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                </section>
                <section
                  className="separator"
                  id="separator2"
                  role="presentation"
                  aria-hidden="true"
                >
                  <video autoPlay muted loop>
                    <source src="/separator_red.mp4" type="video/mp4" />
                  </video>
                </section>
              </>
            );

          case "mundo":
            return (
              <>
                <section
                  key={section.id}
                  className="section mundo-section"
                  id="mundo"
                >
                  <div className="container">
                    <div class="media">
                      <video autoPlay muted loop aria-label="Mundo Batala">
                        <source src="/globe.mp4" type="video/mp4" />
                      </video>
                    </div>
                    <div className="text-content">
                      <h2>Mundo Batala</h2>
                      {section.settings.text?.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  </div>
                </section>
                <section
                  className="separator"
                  id="separator2"
                  role="presentation"
                  aria-hidden="true"
                >
                  <video autoPlay muted loop>
                    <source
                      src="/separator_black.mp4"
                      type="video/mp4"
                    />
                  </video>
                </section>
              </>
            );

          case "gallery":
            return (
              <section
                key={section.id}
                className="section gallery-section"
                id="gallery"
              >
                <div className="container">
                  <h2>Galerie</h2>
                  <div className="gallery-grid">
                    {section.settings.images?.map(
                      (img) =>
                        img.visible && (
                          <a
                            key={img.id}
                            className="gallery-item"
                            href={getMediaUrl(img.mediaId)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img src={getMediaUrl(img.mediaId)} alt={img.alt} />
                          </a>
                        )
                    )}
                  </div>
                  <div className="videos-grid">
                    {section.settings.videos?.map(
                      (video) =>
                        video.visible && (
                          <div key={video.id} className="video-item">
                            <iframe
                              src={convertToEmbedUrl(video.src)}
                              title={video.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )
                    )}
                  </div>
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

      {/* Contact Modal */}
      <div
        className="contact-modal"
        id="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-hidden={isContactOpen ? "false" : "true"}
        style={{ visibility: isContactOpen ? "visible" : "hidden" }}
        data-state={isContactOpen ? "open" : "closed"}
      >
        <div className="contact-modal-content">
          <button
            className="close-contact-modal"
            onClick={() => setIsContactOpen(false)}
            aria-label="Fermer"
          >
            &times;
          </button>

          <h2>Contactez Batala La Rochelle</h2>

          <form onSubmit={handleContactSubmit}>
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              name="name"
              value={contactForm.name}
              onChange={handleContactChange}
              required
            />

            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={contactForm.email}
              onChange={handleContactChange}
              required
            />

            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={contactForm.message}
              onChange={handleContactChange}
              required
            />

            {contactMessage && (
              <div className="contact-message">{contactMessage}</div>
            )}

            <button type="submit" disabled={contactLoading}>
              {contactLoading ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <img src="/FOOTER.svg" alt="Footer Batala" className="footer-background" />
        <div className="container">
          <nav className="footer-nav">
            <a href="#events" className="nav_link">
              Agenda
            </a>
            <a href="#mundo" className="nav_link">
              Mundo
            </a>
            <a href="#gallery" className="nav_link">
              Photos
            </a>
          </nav>

          <div className="contact" id="contact">
            <button
              className="btn-contact-modal"
              aria-haspopup="dialog"
              aria-controls="contact-modal"
              onClick={openContactModal}
            >
              Contact
            </button>
          </div>
          <nav className="footer-social">
            <a
              href="https://www.facebook.com/batalalarochelle"
              className="social_link"
              aria-label="Lien vers la page Facebook de Batala La Rochelle"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-facebook"></i>
            </a>
            <a
              href="https://www.instagram.com/batalalarochelle/"
              className="social_link"
              aria-label="Lien vers le compte Instagram de Batala La Rochelle"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://www.youtube.com/channel/UC2nkR0cyMLRxYs1yk1ktHgQ"
              class="social_link"
              aria-label="Lien vers la chaîne YouTube de Batala La Rochelle"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="fa-brands fa-youtube"></i>
            </a>
          </nav>
        </div>
      </footer>
      <div className="copyright">
        <p>
          © 2025{" "}
          <a
            href="https://caixadev.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            caixaDev
          </a>
          . Tous droits réservés.
        </p>
      </div>
    </div>
  );
};
