import { useState } from "react";
import { authService } from "../services/api";
import "./LoginPage.css";

export const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [success, setSuccess] = useState(false);

  // Gestion du formulaire login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (showReset) {
      // Demande de reset
      try {
        await authService.requestPasswordReset(email);
        setSuccess(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await authService.login(email, password);
      onLogin(data.token, data.admin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gestion ouverture du reset
  const handleOpenReset = (e) => {
    e.preventDefault();
    setShowReset(true);
    setError(null);
    setSuccess(false);
    setPassword("");
  };

  // Gestion retour au login
  const handleBackToLogin = (e) => {
    e.preventDefault();
    setShowReset(false);
    setError(null);
    setSuccess(false);
    setPassword("");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Batala Admin</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || showReset}
              style={showReset ? { background: '#eee', cursor: 'not-allowed' } : {}}
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && showReset && (
            <div className="success-message">
              Un email de renouvellement a été envoyé si l'utilisateur existe.
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading
              ? showReset
                ? "Envoi..."
                : "Connexion..."
              : showReset
                ? "Envoyer le lien de renouvellement"
                : "Se connecter"}
          </button>
        </form>
        {!showReset ? (
          <div className="reset-password-link">
            <a href="#" onClick={handleOpenReset}>
              Renouveler mot de passe
            </a>
          </div>
        ) : (
          <div className="reset-password-link">
            <a href="#" onClick={handleBackToLogin}>
              Retour à la connexion
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
