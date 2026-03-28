import type { Guest } from "../types/invitationType";
import "../styles/Guests.css";

type GuestsProps =
  | {
      title: string;
      invited: Guest[];
      type: "attendees";
      delete?: (invitation: Guest) => void;
      isOrganizer?: boolean;
    }
  | {
      title: string;
      invited: Guest[];
      type: "others";
      delete?: (invitation: Guest) => void;
      isOrganizer?: boolean;
    };

function Guests(props: GuestsProps) {
  const { title, invited } = props;

  return (
    <article className="guests-article">
      <h3>
        {title}
        <span className="guest-count">({invited.length})</span>
      </h3>
      <ul>
        {invited.map((invitation) => (
          <li key={invitation.id}>
            <div className="left-side">
              <div
                className={
                  props.type === "others" ? "avatar avatar-empty" : "avatar"
                }
              >
                {invitation.avatarUrl ? (
                  <img src={invitation.avatarUrl} alt={invitation.name} />
                ) : props.type === "others" ? (
                  <span>👤</span>
                ) : (
                  <span className="avatar-initial">
                    <span>👤</span>
                    {/*invitation.name.charAt(0)*/}
                  </span>
                )}
              </div>
              <div>
                <p className="name">{invitation.name}</p>
                <p className="date">
                  {invitation.addedAt && (
                    <>
                      Ajouté le{" "}
                      {new Date(invitation.addedAt).toLocaleDateString("fr-FR")}
                    </>
                  )}
                </p>
                {invitation.lastReminderAt && (
                  <p className="date date-small">
                    Relancé le{" "}
                    {new Date(invitation.lastReminderAt).toLocaleDateString(
                      "fr-FR",
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="right-side">
              {props.type === "attendees" ? (
                invitation.role === "organisateur" ? (
                  <span className="badge badge-organisateur">Organisateur</span>
                ) : props.isOrganizer ? (
                  <button
                    type="button"
                    className="badge badge-accepted"
                    onClick={() => props.delete?.(invitation)}
                  >
                    Retirer
                  </button>
                ) : (
                  <span className="badge badge-participant">Participant</span>
                )
              ) : invitation.inviteState === "refuse" ? (
                <>
                  <span className="badge badge-refuse">Refusé</span>
                </>
              ) : (
                <>
                  <span className="badge badge-pending">En Attente</span>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default Guests;
