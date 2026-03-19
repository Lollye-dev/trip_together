import { useRef, useState } from "react";
import type { FormEventHandler } from "react";
import { Link, useNavigate } from "react-router";
import { useEmailValidation } from "../hooks/useEmailValidation";
import "../styles/Login.css";

import { useAuth } from "../contexts/AuthContext";

function Login() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { email, emailError, handleEmailChange, handleEmailBlur } =
    useEmailValidation();

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setError("");

    if (!email) {
      setError("Veuillez entrer votre email");
      return;
    }

    if (emailError) {
      setError("Veuillez entrer une adresse email valide");
      return;
    }

    if (!passwordRef.current?.value) {
      setError("Veuillez entrer votre mot de passe");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: passwordRef.current?.value,
          }),
        },
      );

      if (response.status === 200) {
        const data = await response.json();
        setAuth(data);
        localStorage.setItem("token", data.token);
        localStorage.setItem("auth", JSON.stringify(data));
        navigate("/", { replace: true });
        window.scrollTo({ top: 0 });
      } else if (response.status === 401) {
        setError("Email ou mot de passe incorrect");
      } else if (response.status === 403) {
        setError("Aucun compte associé à cet email");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de se connecter au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth auth-page">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-icon">🧳</span>
          <h1 className="logo-text">Trip Together</h1>
        </div>
        <h2 className="title">Bon retour parmi nous</h2>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              id="email"
              className={`form-input ${emailError ? "input-error" : ""}`}
              placeholder="Email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              required
            />
            {emailError && <span className="error-text">⚠️ {emailError}</span>}
            {email && !emailError && (
              <span className="validation-icon">✅</span>
            )}
          </div>
          <div className="input-group">
            <input
              ref={passwordRef}
              type="password"
              id="password"
              className="form-input"
              autoComplete="current-password"
              placeholder="Mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !!emailError || !email}
          >
            {isLoading ? "Connexion en cours..." : "SE CONNECTER"}
          </button>
        </form>
        <div className="footer-login">
          Pas encore membre ?
          <Link to="/register" onClick={() => window.scrollTo({ top: 0 })}>
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
