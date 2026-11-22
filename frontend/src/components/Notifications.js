
import React from "react";

function Notifications({
  notifications = [],
  marquerCommeLue,
  marquerToutesCommeLues,
  fermerNotifications
}) {
  const notificationsNonLues = notifications.filter(
    (notification) => !notification.lue
  ).length;

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <div>
          <h3>Notifications</h3>
          <span>
            {notificationsNonLues} non lue(s)
          </span>
        </div>

        <button
          type="button"
          onClick={fermerNotifications}
          className="notifications-close"
        >
          ×
        </button>
      </div>

      {notifications.length > 0 ? (
        <>
          {notificationsNonLues > 0 && (
            <button
              type="button"
              className="notifications-read-all"
              onClick={marquerToutesCommeLues}
            >
              Tout marquer comme lu
            </button>
          )}

          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.lue ? "notification-read" : "notification-unread"
                }`}
              >
                <div className="notification-content">
                  <strong>{notification.titre}</strong>
                  <p>{notification.message}</p>

                  {notification.date && (
                    <small>{notification.date}</small>
                  )}
                </div>

                {!notification.lue && (
                  <button
                    type="button"
                    className="notification-mark-read"
                    onClick={() => marquerCommeLue(notification.id)}
                    title="Marquer comme lue"
                  >
                    ✓
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="notifications-empty">
          <p>Aucune notification pour le moment.</p>
        </div>
      )}
    </div>
  );
}

export default Notifications;
