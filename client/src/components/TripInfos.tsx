import TripCard from "../pages/TripCard";
import TripInvitation from "../pages/TripInvitation";
import type { TripInfosProps } from "../types/tripType";
import Modal from "./Modal";
import "../styles/TripInfos.css";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function TripInfos({ trip }: TripInfosProps) {
  if (!trip) return null;

  const tripId = trip.id;
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const openInviteModal = () => setIsInviteModalOpen(true);
  const closeInviteModal = () => setIsInviteModalOpen(false);

  const { auth } = useAuth();
  const isOrganizer = auth?.user.id === trip.user_id;

  return (
    <>
      <header
        className="trip-header"
        style={{
          backgroundImage: `url(${trip.image_url || "/images/default-city.jpg"})`,
        }}
      />
      <section className="trip-trip-infos">
        <article className="trip-tripinfocard">
          {trip && (
            <TripCard
              title={trip.title}
              description={trip.description}
              city={trip.city}
              country={trip.country}
              startAt={trip.start_at}
              endAt={trip.end_at}
              participants={trip.participants}
              role={isOrganizer ? "organizer" : "participant"}
              onInvite={openInviteModal}
            />
          )}
        </article>
      </section>
      <Modal isOpen={isInviteModalOpen} onClose={closeInviteModal}>
        {trip && (
          <TripInvitation
            tripId={tripId}
            title={trip.title}
            city={trip.city}
            country={trip.country}
            startAt={trip.start_at}
            endAt={trip.end_at}
            participants={trip.participants}
            onClose={closeInviteModal}
          />
        )}
      </Modal>
    </>
  );
}
export default TripInfos;
