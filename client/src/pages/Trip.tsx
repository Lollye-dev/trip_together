import NavTabs from "../components/NavTabs";
import TripInfos from "../components/TripInfos";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Trip.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import StepCard from "../components/StepCard";
import type { Step, TheTrip } from "../types/tripType";

function Trip() {
  type RouteParams = {
    id: string;
  };

  const { id } = useParams<RouteParams>();
  const tripId = Number(id);
  const [steps, setSteps] = useState<Step[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [myTrip, setMyTrip] = useState<TheTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const authErrorHandledRef = useRef(false);

  const { auth, logout } = useAuth();
  const currentUserId = auth?.user?.id || 0;

  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    authErrorHandledRef.current = false;

    if (!tripId) {
      navigate("/", {
        state: {
          toast: {
            type: "error",
            message: "Voyage invalide",
          },
        },
      });
      return;
    }

    setLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (response.status === 401) {
          if (!authErrorHandledRef.current && data.error === "Token expired") {
            authErrorHandledRef.current = true;
            logout();
            navigate("/login");
            toast.error("Session expirée. Veuillez vous reconnecter.");
          } else if (!authErrorHandledRef.current) {
            authErrorHandledRef.current = true;
            navigate("/login");
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Erreur chargement voyage");
        }

        setMyTrip(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Impossible de charger le voyage");
        toast.error("Impossible de charger le voyage");
      })
      .finally(() => setLoading(false));

    fetch(`${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth?.token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (response.status === 401) {
          if (!authErrorHandledRef.current && data.error === "Token expired") {
            authErrorHandledRef.current = true;
            logout();
            navigate("/login");
            toast.error("Session expirée. Veuillez vous reconnecter.");
          } else if (!authErrorHandledRef.current) {
            authErrorHandledRef.current = true;
            navigate("/login");
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Erreur chargement étapes");
        }

        setSteps(data.steps);
        setMemberCount(data.trip.memberCount);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Impossible de charger les étapes");
      });
  }, [tripId, auth?.token, navigate, logout]);

  const validatedSteps = steps.filter((s) => s.status === "validated");

  return (
    <>
      {!loading && myTrip && <TripInfos trip={myTrip} />}
      <div className="trip-page">
        <NavTabs />
        <section className="steps-section">
          <h2 className="section-title">Récapitulatif du voyage</h2>
          <p className="section-subtitle">
            Voici les étapes validées par les membres
          </p>

          {loading && <p className="loading-text">Chargement des étapes</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <section className="steps-container">
              {validatedSteps.length > 0 ? (
                validatedSteps.map((step) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    currentUserId={currentUserId}
                    tripId={tripId}
                    memberCount={memberCount}
                    isOwner={myTrip?.user_id === currentUserId}
                  />
                ))
              ) : (
                <p className="no-steps">Aucune étape validée pour le moment</p>
              )}
            </section>
          )}
        </section>
      </div>
    </>
  );
}

export default Trip;
