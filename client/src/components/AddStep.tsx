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

    if (placeAutocompleteRef.current) {
      return;
    }

    const initAutocomplete = async () => {
      try {
        // @ts-ignore
        const { PlaceAutocompleteElement } =
          await google.maps.importLibrary("places");
        // @ts-ignore
        const autocomplete = new PlaceAutocompleteElement();
        placeAutocompleteRef.current = autocomplete;

        if (inputRef.current) {
          inputRef.current.innerHTML = "";
          inputRef.current.appendChild(autocomplete);
        }

        autocomplete.addEventListener("gmp-places-select", (event: Event) => {
          const customEvent = event as unknown as {
            place: {
              name: string;
              address_components: Array<{ types: string[]; long_name: string }>;
              photos?: Array<{
                getUrl: (opts: { maxWidth: number }) => string;
              }>;
              fetchFields: (opts: { fields: string[] }) => Promise<void>;
            };
          };
          const place = customEvent.place;
          if (!place) return;

          place
            .fetchFields({ fields: ["address_components", "name", "photos"] })
            .then(() => {
              const cityName = place.name || "";
              const countryComp = place.address_components?.find(
                (comp: { types: string[]; long_name: string }) =>
                  comp.types.includes("country"),
              );
              const countryName = countryComp?.long_name || "";
              const photoUrl =
                (
                  place.photos?.[0] as
                    | { getUrl: (opts: { maxWidth: number }) => string }
                    | undefined
                )?.getUrl({ maxWidth: 400 }) || "";

              setCity(cityName);
              setCountry(countryName);
              setImageUrl(photoUrl);
            });
        });
      } catch (error) {
        console.error("Error loading Google Maps Places:", error);
      }
    };

    initAutocomplete();
  }, [isLoaded]);

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

      if (!response.ok) throw new Error("Erreur lors de l'ajout de l'étape");

      setCity("");
      setCountry("");
      setImageUrl("");

      onStepAdded();
    } catch (error) {
      console.error(error);
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
