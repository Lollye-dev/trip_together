import { useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useEmailValidation } from "../hooks/useEmailValidation";

import "../styles/Invitation.css";
import "../styles/TripInvitation.css";

type TripInvitationProps = {
  tripId: number;
  title: string;
  description?: string;
  city: string;
  country: string;
  startAt: string;
  endAt: string;
  participants?: number;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
};

function TripInvitation({
  title,
  description,
  city,
  country,
  startAt,
  endAt,
  participants,
  onClose,
}: TripInvitationProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };
  const { id } = useParams<{ id: string }>();
  const { auth } = useAuth();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);
  const {
    email,
    emailError,
    handleEmailChange,
    handleEmailBlur,
    reset: resetEmail,
  } = useEmailValidation();

  const updateMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const cancelInvitation = (e: React.MouseEvent<HTMLButtonElement>) => {
    resetEmail();
    setMessage("");
    if (onClose) onClose(e);
  };

  const closeModalOverlay = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose(e);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Lien d’invitation copié 📋");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || emailError) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    if (!message.trim()) {
      toast.error("Veuillez ajouter un message personnalisé");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${id}/invitations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify({ email, message }),
        },
      );

      const data = await response.json();

      if (response.status === 404) {
        toast.error("Aucun compte utilisateur trouvé avec cet email");
        return;
      }

      if (response.status === 409) {
        toast.error("Cet utilisateur a déjà été invité à ce voyage");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      await copyToClipboard(data.invitationLink);

      resetEmail();
      setMessage("");
      setInvitationSent(true);
    } catch {
      toast.error("Erreur lors de l'envoi de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section
        className="tripinvitation-overlay"
        onClick={closeModalOverlay}
        tabIndex={-1}
        onKeyDown={() => {}}
      >
        <div className="tripinvitation-invitation-form">
          <article className="tripinvitation-head">
            <p>Invitez une personne à rejoindre ce voyage</p>
          </article>

          <article className="tripinvitation-bg-image" />

          <article className="tripinvitation-trip-infos">
            <h2>{title}</h2>
            {description && (
              <p className="tripinvitation-description">{description}</p>
            )}
            <p className="tripinvitation-location">
              📍 {city}, {country}
            </p>
            <p className="tripinvitation-meta">
              📅 {formatDate(startAt)} - {formatDate(endAt)}
            </p>
            <p className="tripinvitation-participants">
              👥 {participants} participant
              {participants && participants > 1 ? "s" : ""}
            </p>
          </article>

          <form
            onSubmit={sendInvitation}
            className="tripinvitation-form-inputs"
          >
            <label className="tripinvitation-email-form">
              Adresse email *
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                required
                placeholder="adresse@email.com"
                style={{
                  borderColor: emailError ? "#ae8179" : undefined,
                  backgroundColor: emailError ? "#fef5f5" : undefined,
                }}
              />
              {emailError && (
                <span
                  style={{
                    color: "#ae8179",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  ⚠️ {emailError}
                </span>
              )}
            </label>

            <label className="tripinvitation-message-form">
              Message *
              <textarea
                value={message}
                onChange={updateMessage}
                placeholder="Ajoutez un message personnalisé..."
              />
            </label>

            <button
              type="submit"
              className="tripinvitation-btn-send-invitation"
              disabled={loading || !email || !!emailError}
            >
              {loading ? "Copie..." : "Copier le lien d'invitation"}
            </button>

            <button
              type="button"
              className="tripinvitation-btn-cancel-invitation"
              onClick={cancelInvitation}
              disabled={loading}
            >
              {invitationSent ? "Quitter" : "Annuler"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default TripInvitation;
