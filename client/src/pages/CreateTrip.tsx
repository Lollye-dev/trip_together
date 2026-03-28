import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "../styles/CreateTrip.css";
import { useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_LIBRARIES } from "../constants/maps";
import { useAuth } from "../contexts/AuthContext";

export default function CreateTrip() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = auth?.token;
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          toast: {
            type: "error",
            message: "Vous devez être connecté pour créer un voyage",
          },
        },
      });
    }
  }, [auth?.token, navigate]);

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endOfTrip, setEndOfTrip] = useState({ end_at: "" });

  const inputRef = useRef<HTMLDivElement>(null);
  const placeAutocompleteRef = useRef<HTMLElement | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayString = today.toLocaleDateString("fr-CA");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    if (placeAutocompleteRef.current) {
      inputRef.current.appendChild(placeAutocompleteRef.current);
      return;
    }

    const initAutocomplete = async () => {
      try {
        // @ts-ignore
        const { PlaceAutocompleteElement } = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;

        // @ts-ignore
        const autocomplete = new PlaceAutocompleteElement();
        placeAutocompleteRef.current = autocomplete;

        if (inputRef.current) {
          inputRef.current.innerHTML = "";
          inputRef.current.appendChild(autocomplete);
        }

        autocomplete.addEventListener(
          "gmp-places-select",
          async (event: unknown) => {
            const place = (event as { place?: unknown }).place;
            if (!place) return;

            const placeData = place as unknown as {
              name?: string;
              address_components?: Array<{
                types: string[];
                long_name: string;
              }>;
              photos?: Array<{
                getUrl: (opts: { maxWidth: number }) => string;
              }>;
              fetchFields: (opts: { fields: string[] }) => Promise<void>;
            };

            await placeData.fetchFields({
              fields: ["address_components", "name", "photos"],
            });

            const cityName = placeData.name || "";
            const countryComp = placeData.address_components?.find((comp) =>
              comp.types.includes("country"),
            );
            const countryName = countryComp?.long_name;
            const photoUrl =
              placeData.photos?.[0]?.getUrl({ maxWidth: 600 }) || "";

            setCity(cityName);
            if (countryName) setCountry(countryName);
            setImageUrl(photoUrl);
          },
        );

        autocomplete.addEventListener("change", () => {
          const inputElement = autocomplete as HTMLElement & { value: string };
          setCity(inputElement.value);
        });
      } catch (error) {
        console.error("Error loading Google Maps Places library:", error);
      }
    };

    initAutocomplete();
  }, [isLoaded]);

  const submitCreateTrip = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!auth?.token) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (!titleRef.current || !descriptionRef.current || !startDate) {
      toast.error("Formulaire incomplet");
      return;
    }

    let currentCity = city;
    if (!currentCity && placeAutocompleteRef.current) {
      currentCity = (
        placeAutocompleteRef.current as HTMLElement & { value: string }
      ).value;
    }

    let currentCountry = country;
    if (!currentCountry && currentCity && currentCity.includes(",")) {
      const parts = currentCity.split(",").map((p) => p.trim());

      currentCity = parts[0];
      currentCountry = parts[parts.length - 1];
    }

    const departureDate = new Date(startDate);
    const returnDate = new Date(endOfTrip.end_at);

    if (departureDate < today) {
      toast.error("La date de départ ne peut pas être dans le passé");
      return;
    }

    if (returnDate <= departureDate) {
      toast.error("La date de retour doit être après la date de départ");
      return;
    }

    if (!currentCity || !currentCountry || !endOfTrip.end_at) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const newTrip = {
      title: titleRef.current.value,
      description: descriptionRef.current.value,
      start_at: startDate,
      end_at: endOfTrip.end_at,
      city: currentCity,
      country: currentCountry,
      image_url: imageUrl,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify(newTrip),
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

      if (response.ok) {
        const result = await response.json();
        navigate(`/trip/${result.insertId}`);
        toast.success("Voyage créé avec succès !");
      } else {
        const result = await response.json();
        toast.error(result.error || "Erreur lors de la création");
        console.error("Erreur serveur:", result);
      }
    } catch (err) {
      console.error(err);
      toast.error("Impossible de créer le voyage.");
    }
  };

  return (
    <div className="create-trip-page">
      <img src="/logos/logo-airplane.png" alt="logo-avion" />
      <h1>
        Créer un nouveau <span>voyage</span>
      </h1>
      <p>Commencez par définir les bases de votre aventure</p>

      <form className="create-trip-form" onSubmit={submitCreateTrip}>
        <div className="form-group">
          <label htmlFor="trip-name">Nom du voyage *</label>
          <input
            type="text"
            id="trip-name"
            ref={titleRef}
            placeholder="Entrez le nom du voyage"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <input
            type="text"
            id="description"
            ref={descriptionRef}
            placeholder="Entrez la description"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">Lieu *</label>
          {/* Conteneur pour le composant Google Places */}
          <div ref={inputRef} style={{ width: "100%" }} />
        </div>

        <div className="date-container">
          <div className="form-group">
            <label htmlFor="start-date">Date de début *</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={todayString}
              required
              className={!endOfTrip.end_at ? "date-empty" : ""}
            />
          </div>

          <div className="form-group">
            <label htmlFor="end-date">Date de fin *</label>
            <input
              type="date"
              id="end-date"
              value={endOfTrip.end_at}
              onChange={(e) => setEndOfTrip({ end_at: e.target.value })}
              min={startDate || todayString}
              required
              disabled={!startDate}
              className={!endOfTrip.end_at ? "date-empty" : ""}
            />
          </div>
        </div>
        <div>
          <p className="astuces-container">
            💡 Vous pourrez inviter des membres et ajouter des étapes une fois
            le voyage créé. Un voyage nécessite au minimum 2 participants.
          </p>
        </div>

        <div className="button-container">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>
          <button type="submit" className="create-trip-button">
            Créer le voyage
          </button>
        </div>
      </form>
    </div>
  );
}
