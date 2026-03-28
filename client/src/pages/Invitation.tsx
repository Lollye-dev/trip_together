import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import "../styles/invitation.css";
import TripInfos from "../components/TripInfos";
import { useAuth } from "../contexts/AuthContext";
import type { invitationType } from "../types/invitationType";
import type { TheTrip } from "../types/tripType";

function Invitation() {
  const { id, invitationId } = useParams<{
    id: string;
    invitationId: string;
  }>();
  const [invitation, setInvitation] = useState<invitationType | null>(null);
  const [mytrip, setmyTrip] = useState<TheTrip | null>(null);
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  useEffect(() => {
    if (!invitationId) {
      navigate("/", {
        state: {
          toast: {
            type: "error",
            message: "Invitation invalide",
          },
        },
      });
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/trips/${id}`, {
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
    })

      .then(async (response) => {
        if (response.status === 401) {
          navigate("/login", {
            state: {
              toast: {
                type: "error",
                message: "Votre session a expiré. Veuillez vous reconnecter.",
              },
            },
          });
          return;
        }
        if (!response.ok) {
          throw new Error("Erreur chargement voyage");
        }
        const data = await response.json();
        setmyTrip(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Impossible de charger le voyage");
      });

    fetch(`${import.meta.env.VITE_API_URL}/api/invitation/${invitationId}`)
      .then(async (response) => {
        const invitation = await response.json();

        if (response.status === 400) {
          navigate("/", {
            state: {
              toast: {
                type: "error",
                message: invitation.message,
              },
            },
          });
          return;
        }

        if (response.status === 403) {
          navigate("/", {
            state: {
              toast: {
                type: "error",
                message: invitation.message,
              },
            },
          });
          return;
        }

        if (response.status === 404) {
          navigate("/", {
            state: {
              toast: {
                type: "error",
                message: invitation.message,
              },
            },
          });
          return;
        }

        if (response.status === 409) {
          navigate("/", {
            state: {
              toast: {
                type: "error",
                message: invitation.message,
              },
            },
          });
          return;
        }

        if (response.status === 410) {
          navigate("/", {
            state: {
              toast: {
                type: "error",
                message: invitation.message,
              },
            },
          });
          return;
        }

        setInvitation(invitation);
      })
      .catch(() => {
        navigate("/", {
          state: {
            toast: {
              type: "error",
              message: "Invitation introuvable ou accès non autorisé",
            },
          },
        });
      });
  }, [invitationId, id, auth?.token, navigate]);

  async function invitationResponded(status: "accepted" | "refused") {
    if (!invitationId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/invitation/${invitationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      if (response.status === 401) {
        logout();
        navigate("/login", {
          state: {
            toast: {
              type: "error",
              message: "Votre session a expiré. Veuillez vous reconnecter.",
            },
          },
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (status === "accepted") {
        toast.success("Invitation acceptée");
        navigate(`/trip/${id ?? invitation?.trip_id}`);
      } else {
        navigate("/", {
          state: {
            toast: {
              type: "error",
              message: "Invitation refusée",
            },
          },
        });
      }
    } catch (err) {
      toast.error("Erreur lors du traitement de l'invitation");
    }
  }

  return (
    <>
      <TripInfos trip={mytrip} />
      <div className="invitation-main">
        <article id="invitation" className="invitation-card">
          <p className="invitation-text">{`${auth?.user.firstname ?? ""}, vous avez été invité au voyage de`}</p>
          <img
            src="/profile-pic-logo.png"
            alt={invitation?.creator_firstname}
            className="invitation-avatar"
          />
          <p className="invitation-inviter-name">
            {`${invitation?.creator_firstname ?? ""} ${
              invitation?.creator_lastname ?? ""
            }`}
          </p>
          <p>"{invitation?.message}"</p>

          <div className="invitation-actions">
            <button
              type="button"
              className="invitation-btn-primary"
              onClick={() => invitationResponded("accepted")}
            >
              Accepter
            </button>
            <button
              type="button"
              className="invitation-btn-outline"
              onClick={() => invitationResponded("refused")}
            >
              Refuser
            </button>
          </div>
        </article>
      </div>
    </>
  );
}

export default Invitation;
