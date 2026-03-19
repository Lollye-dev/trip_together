import { useRef, useState } from "react";
import type { ChangeEventHandler, FormEventHandler } from "react";
import { useNavigate } from "react-router";
// import { useToast } from "../hooks/useToast";
import { toast } from "react-toastify";
import { useEmailValidation } from "../hooks/useEmailValidation";
import "../styles/Login.css";

function Register() {
  const firstnameRef = useRef<HTMLInputElement>(null);
  const lastnameRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  // const { toast } = useToast();
  const { email, emailError, handleEmailChange, handleEmailBlur } =
    useEmailValidation();

  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setErrors([]);

    // Client-side validation
    if (!email || emailError) {
      toast.error("Veuillez remplir une adresse email valide");
      return;
    }

    if (!firstnameRef.current?.value || !firstnameRef.current?.value.trim()) {
      toast.error("Le prénom est obligatoire");
      return;
    }

    if (!lastnameRef.current?.value || !lastnameRef.current?.value.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstname: firstnameRef.current?.value,
            lastname: lastnameRef.current?.value,
            email,
            password,
          }),
        },
      );

      if (response.status === 201) {
        toast.success("Inscription réussie");
        navigate("/login");
      } else if (response.status === 400) {
        const data = await response.json();
        setErrors(
          data.errors || ["Une erreur est survenue lors de l'inscription"],
        );
      } else {
        toast.error("Une erreur est survenue lors de l'inscription");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth auth-page">
      <div className="auth-card">
        <div className="logo-container">
          <span className="logo-icon">🧳</span> {/* Placeholder icon */}
          <h1 className="logo-text">Trip Together</h1>
        </div>
        <h2 className="title">Planifiez votre prochaine aventure</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((err) => (
                <div key={err} className="error-message">
                  ❌ {err}
                </div>
              ))}
            </div>
          )}

          <div className="input-group">
            <input
              ref={lastnameRef}
              type="text"
              id="lastname"
              className="form-input"
              placeholder="Nom"
              minLength={2}
              maxLength={75}
              required
            />
          </div>

          <div className="input-group">
            <input
              ref={firstnameRef}
              type="text"
              id="firstname"
              className="form-input"
              placeholder="Prénom"
              minLength={2}
              maxLength={50}
              required
            />
          </div>

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
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Mot de passe (min. 8 caractères)"
              minLength={8}
              required
            />
            {password.length >= 8 && (
              <span className="validation-icon">✅</span>
            )}
          </div>

          <div className="input-group">
            <input
              type="password"
              id="confirm-password"
              className={`form-input ${password && confirmPassword && password !== confirmPassword ? "input-error" : ""}`}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirmer le mot de passe"
              required
            />
            {password && confirmPassword && password === confirmPassword && (
              <span className="validation-icon">✅</span>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !!emailError}
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>

          <p className="auth-link">
            Vous avez déjà un compte ? <a href="/login">Se connecter</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
