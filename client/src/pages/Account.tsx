import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Account.css";

export default function Account() {
  const { auth, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!auth) {
      navigate("/login");
    }
  }, [auth, isLoading, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!auth) {
    return null;
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <section className="account-card">
          <article className="logo-container">
            <span className="logo-icon">🧳</span>
            <h1 className="logo-text">Trip Together</h1>
          </article>

          <article className="account-header">
            <div className="account-avatar">
              {auth.user.firstname.charAt(0).toUpperCase()}
              {auth.user.lastname.charAt(0).toUpperCase()}
            </div>
            <h2>Informations du compte</h2>
          </article>

          <article className="account-details">
            <div className="detail-item">
              <h3>Prénom</h3>
              <p>{auth.user.firstname}</p>
            </div>
            <div className="detail-item">
              <h3>Nom</h3>
              <p>{auth.user.lastname}</p>
            </div>
            <div className="detail-item">
              <h3>Email</h3>
              <p>{auth.user.email}</p>
            </div>
            <div className="detail-item">
              <h3>ID utilisateur</h3>
              <p className="id-text">{auth.user.id}</p>
            </div>
          </article>

          <article className="account-actions">
            <button type="button" className="btn-logout" onClick={handleLogout}>
              Se déconnecter
            </button>
          </article>
        </section>
      </div>
    </div>
  );
}
