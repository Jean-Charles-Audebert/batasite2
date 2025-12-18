import { useState, useEffect } from "react";
import { adminsService } from "../services/api";
import "./AdminsPage.css";

export const AdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminsService.getAdmins();
      setAdmins(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const updated = await adminsService.toggleAdminActive(id);
      setAdmins(admins.map((a) => (a.id === id ? updated : a)));
      setMessage({
        type: "success",
        text: `Admin ${updated.is_active ? "activé" : "désactivé"}`,
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    setCreatingAdmin(true);
    try {
      await adminsService.createAdmin(newEmail);
      setMessage({
        type: "success",
        text: "Admin créé et email d'invitation envoyé",
      });
      setNewEmail("");
      setShowCreateModal(false);
      loadAdmins();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setCreatingAdmin(false);
    }
  };

  if (loading) return <div className="admins-loading">Chargement...</div>;

  return (
    <div className="admins-page">
      <header className="admins-header">
        <h2>Gestion des Administrateurs</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="create-admin-btn"
        >
          + Créer un Admin
        </button>
      </header>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <div className="admins-list">
        {admins.length === 0 ? (
          <p className="no-admins">Aucun administrateur</p>
        ) : (
          admins.map((a) => (
            <div key={a.id} className="admin-card">
              <div className="admin-info">
                <p className="admin-email">{a.email}</p>
                <p className="admin-role">Admin</p>
              </div>
              <div className="admin-actions">
                <button
                  className={`toggle-btn ${a.is_active ? "active" : "inactive"}`}
                  onClick={() => handleToggleActive(a.id, a.is_active)}
                  title={a.is_active ? "Désactiver" : "Activer"}
                >
                  {a.is_active ? (
                    <i className="fa-solid fa-circle-check"></i>
                  ) : (
                    <i className="fa-solid fa-circle-xmark"></i>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Créer un nouvel administrateur</h3>
            <form onSubmit={handleCreateAdmin}>
              <input
                type="email"
                placeholder="Email du nouvel admin"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="cancel-btn"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="submit-btn"
                >
                  {creatingAdmin ? "Envoi..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
