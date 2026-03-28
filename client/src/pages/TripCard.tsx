import "../styles/TripCard.css";
import type { TripCardProps } from "../types/tripType";

function TripCard({
  title,
  description,
  city,
  country,
  startAt,
  endAt,
  participants,
  role,
  onInvite,
}: TripCardProps) {
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

  return (
    <>
      <article className="tripcard-component">
        <div className="tripcard-top">
          <div className="tripcard-header">
            <h1 className="tripcard-title">{title}</h1>
            <h2 className="tripcard-description">{description}</h2>
          </div>

          {role === "organizer" && onInvite && (
            <button
              type="button"
              className="tripcard-invitation-btn"
              onClick={onInvite}
            >
              Inviter
            </button>
          )}
        </div>

        <div className="tripcard-bottom">
          <p className="tripcard-location">
            📍 {city}, {country}
          </p>
          <p className="tripcard-dates">
            📅 {formatDate(startAt)} - {formatDate(endAt)}
          </p>
          <p className="tripcard-participants">
            👥 {participants} participant
            {participants && participants > 1 ? "s" : ""}
          </p>
        </div>
      </article>
    </>
  );
}

export default TripCard;
