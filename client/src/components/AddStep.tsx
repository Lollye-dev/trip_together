import { useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import { GOOGLE_MAPS_LIBRARIES } from "../constants/maps";
import { useAuth } from "../contexts/AuthContext";
import "../styles/AddStep.css";
import type { AddStepProps } from "../types/stepAdd";

export default function AddStep({ onStepAdded }: AddStepProps) {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const inputRef = useRef<HTMLDivElement>(null);
  const placeAutocompleteRef = useRef<HTMLElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    const container = inputRef.current;

    const initAutocomplete = async () => {
      try {
        // @ts-ignore
        const { PlaceAutocompleteElement } = (await google.maps.importLibrary(
          "places",
        )) as google.maps.PlacesLibrary;

        // @ts-ignore
        const autocomplete = new PlaceAutocompleteElement();
        placeAutocompleteRef.current = autocomplete;

        container.innerHTML = "";
        container.appendChild(autocomplete);

        let lastProcessed = "";

        const checkValueInterval = setInterval(() => {
          const currentValue = (autocomplete as unknown as { value: string })
            .value;

          if (
            currentValue &&
            currentValue !== lastProcessed &&
            currentValue.includes(",") &&
            currentValue.length > 5
          ) {
            lastProcessed = currentValue;
            handlePlaceSelect(currentValue);
          }
        }, 500);

        return () => clearInterval(checkValueInterval);
      } catch (error) {
        console.error("Erreur Google Maps Places:", error);
      }
    };

    const cleanup = initAutocomplete();
    return () => {
      cleanup?.then((fn) => fn?.());
    };
  }, [isLoaded]);

  const handlePlaceSelect = (fullAddress: string) => {
    if (!fullAddress || fullAddress.length < 3) {
      return;
    }

    const parts = fullAddress.split(",").map((p) => p.trim());

    if (parts.length >= 2) {
      setCity(parts[0]);
      setCountry(parts[parts.length - 1]);
    } else if (parts.length === 1) {
      setCity(parts[0]);
    }
  };

  const { auth } = useAuth();
  const { tripId: routeTripId, id } = useParams();
  const tripId = routeTripId || id;

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.token) return;

    const user_id = auth?.user?.id;
    if (!user_id) return;

    if (!city || !country) {
      toast.error("Veuillez indiquer un lieu valide");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${tripId}/steps`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify({ city, country, user_id, image_url: imageUrl }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        const errorMsg =
          responseData.error || "Erreur lors de l'ajout de l'étape";
        toast.error(errorMsg);
        return;
      }

      setCity("");
      setCountry("");
      setImageUrl("");

      onStepAdded();
      toast.success("Étape ajoutée avec succès");
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Erreur inconnue";
      console.error("Erreur lors de l'ajout d'étape:", errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="add-step-form-container">
      <form className="add-step-form" onSubmit={handleAddStep}>
        <label htmlFor="city">Lieu</label>
        <div className="add-step-form-group">
          <div
            ref={inputRef}
            className="input-container"
            style={{ width: "100%" }}
          />
          <button type="submit" className="add-btn">
            Ajouter cette étape
          </button>
        </div>
      </form>
    </div>
  );
}
