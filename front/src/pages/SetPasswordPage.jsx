import { useState, useEffect } from "react";
import { adminsService } from "../services/api";
import "./SetPasswordPage.css";

export const SetPasswordPage = ({ setView }) => {
  const [token, setToken] = useState("");
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extraire le token de l'URL
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      setError("Token manquant");
      setLoading(false);
      return;
    }

    setToken(tokenParam);

    // Vérifier le token
    const verifyToken = async () => {
      try {
        const result = await adminsService.verifyToken(tokenParam);
        setAdmin(result.admin);
      } catch (err) {
        setError(err.message || "Token invalide ou expiré");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await adminsService.setPassword(token, password);
      setSuccess(true);

      // Redirection après 3 secondes
      setTimeout(() => {
        setView('login');
      }, 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de la définition du mot de passe");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="set-password-page">
        <div className="set-password-container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !admin) {
    return (
      <div className="set-password-page">
        <div className="set-password-container">
          <div className="error-box">{error}</div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="set-password-page">
        <div className="set-password-container">
          <div className="success-box">
            <i className="fa-solid fa-circle-check"></i>
            <h2>Succès!</h2>
            <p>Votre mot de passe a été défini.</p>
            <p>Redirection vers la connexion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="set-password-page">
      <div className="set-password-container">
        <h2>Définir votre mot de passe</h2>
        <p className="admin-email">Compte: {admin?.email}</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? "Création..." : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
};
