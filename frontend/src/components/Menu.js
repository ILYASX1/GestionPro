
import { useState } from "react";
import Notifications from "./Notifications";

function Menu({
  pageActive,
  changerPage,
  utilisateur,
  deconnecter,
  notifications = [],
  nombreNotificationsNonLues = 0,
  marquerCommeLue,
  marquerToutesCommeLues,
}) {
  const [notificationsOuvertes, setNotificationsOuvertes] =
    useState(false);

  const pages = [
    { id: "Accueil", nom: "Accueil" },
    { id: "Clients", nom: "Clients" },
    { id: "Devis", nom: "Devis" },
    { id: "Factures", nom: "Factures" },
    { id: "Paiements", nom: "Paiements" },
    { id: "Relances", nom: "Relances" },
  ];

  if (utilisateur?.role === "super_admin") {
    pages.push({
      id: "Administrateurs",
      nom: "Administrateurs",
    });
  }

  return (
    <nav className="menu">
      <div className="logo">
        <img src="/logo.png" alt="Logo GestionPro" />
        <span>GestionPro</span>
      </div>

      <div className="menu-liens">
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            className={
              pageActive === page.id ? "lien actif" : "lien"
            }
            onClick={() => changerPage(page.id)}
          >
            {page.nom}
          </button>
        ))}
      </div>

      <div className="menu-utilisateur">
        <div className="utilisateur-infos">
          <span className="utilisateur-nom">
            {utilisateur?.nom}
          </span>

          <small>
            {utilisateur?.role === "super_admin"
              ? "Super administrateur"
              : "Administrateur"}
          </small>
        </div>

        <div className="notifications-container">
          <button
            type="button"
            className="bouton-notifications"
            onClick={() =>
              setNotificationsOuvertes((ouvert) => !ouvert)
            }
            aria-label="Ouvrir les notifications"
            aria-expanded={notificationsOuvertes}
          >
            <span className="icone-cloche">🔔</span>

            {nombreNotificationsNonLues > 0 && (
              <span className="badge-notifications">
                {nombreNotificationsNonLues > 99
                  ? "99+"
                  : nombreNotificationsNonLues}
              </span>
            )}
          </button>

          {notificationsOuvertes && (
            <Notifications
              notifications={notifications}
              marquerCommeLue={marquerCommeLue}
              marquerToutesCommeLues={marquerToutesCommeLues}
              fermerNotifications={() =>
                setNotificationsOuvertes(false)
              }
            />
          )}
        </div>

        <button
          type="button"
          className="bouton-deconnexion"
          onClick={deconnecter}
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}

export default Menu;
