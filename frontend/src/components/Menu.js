
import { useState } from "react";
import Notifications from "./Notifications";

const navigation = [
  { id: "Accueil", nom: "Tableau de bord", icon: "dashboard" },
  { id: "Clients", nom: "Clients", icon: "users" },
  { id: "Devis", nom: "Devis", icon: "document" },
  { id: "Factures", nom: "Factures", icon: "invoice" },
  { id: "Paiements", nom: "Paiements", icon: "wallet" },
  { id: "Relances", nom: "Relances", icon: "bell" },
];

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="5" rx="2" />
        <rect x="13" y="10" width="8" height="11" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    document: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    ),
    invoice: (
      <>
        <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 9h18M16 14h.01" />
        <path d="M7 5V3h11" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    chevron: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.document}</svg>;
}

function Menu({
  pageActive,
  changerPage,
  utilisateur,
  ouvrirMonCompte,
  deconnecter,
  notifications = [],
  nombreNotificationsNonLues = 0,
  marquerCommeLue,
  marquerToutesCommeLues,
}) {
  const [notificationsOuvertes, setNotificationsOuvertes] =
    useState(false);

  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  const [menuReduit, setMenuReduit] = useState(false);

  const pages = [...navigation];

  if (utilisateur?.role === "super_admin") {
    pages.push({
      id: "Administrateurs",
      nom: "Administrateurs",
      icon: "shield",
    });
  }

  function selectionnerPage(id) {
    changerPage(id);
    setMenuMobileOuvert(false);
  }

  return (
    <>
      <button
        type="button"
        className="menu-mobile-toggle"
        onClick={() => setMenuMobileOuvert((ouvert) => !ouvert)}
        aria-label="Ouvrir le menu"
      >
        <span>☰</span>
      </button>

      {menuMobileOuvert && (
        <button
          type="button"
          className="menu-mobile-overlay"
          onClick={() => setMenuMobileOuvert(false)}
          aria-label="Fermer le menu"
        />
      )}

      <aside
        className={[
          "menu",
          menuReduit ? "menu-reduit" : "",
          menuMobileOuvert ? "menu-ouvert" : "",
        ].join(" ")}
      >
        <div className="menu-entete">
          <div className="logo">
            <img src="/logo.png" alt="GestionPro" />
            {!menuReduit && (
              <div className="logo-texte">
                <span>GestionPro</span>
                <small>Gestion commerciale</small>
              </div>
            )}
          </div>

          <button
            type="button"
            className="menu-toggle"
            onClick={() => setMenuReduit((reduit) => !reduit)}
            aria-label={menuReduit ? "Développer le menu" : "Réduire le menu"}
            title={menuReduit ? "Développer le menu" : "Réduire le menu"}
          >
            <Icon name="chevron" size={18} />
          </button>
        </div>

        <div className="menu-section-titre">
          {!menuReduit && "MENU PRINCIPAL"}
        </div>

        <nav className="menu-liens">
          {pages
            .filter((page) => page.id !== "Administrateurs")
            .map((page) => (
              <button
                key={page.id}
                type="button"
                className={pageActive === page.id ? "lien actif" : "lien"}
                onClick={() => selectionnerPage(page.id)}
                title={menuReduit ? page.nom : undefined}
              >
                <span className="lien-icone">
                  <Icon name={page.icon} />
                </span>
                {!menuReduit && <span>{page.nom}</span>}
              </button>
            ))}
        </nav>

        {utilisateur?.role === "super_admin" && (
          <>
            <div className="menu-section-titre administration-titre">
              {!menuReduit && "ADMINISTRATION"}
            </div>

            <nav className="menu-liens">
              {pages
                .filter((page) => page.id === "Administrateurs")
                .map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    className={pageActive === page.id ? "lien actif" : "lien"}
                    onClick={() => selectionnerPage(page.id)}
                    title={menuReduit ? page.nom : undefined}
                  >
                    <span className="lien-icone">
                      <Icon name={page.icon} />
                    </span>
                    {!menuReduit && <span>{page.nom}</span>}
                  </button>
                ))}
            </nav>
          </>
        )}

        <div className="menu-bas">

          <button
            type="button"
            className="menu-profil bouton-profil"
            onClick={() => {
              ouvrirMonCompte?.();
              setMenuMobileOuvert(false);
            }}
            title={menuReduit ? "Mon compte" : undefined}
            aria-label="Ouvrir mon compte"
          >
            <div className="profil-avatar">
              {utilisateur?.nom?.charAt(0)?.toUpperCase() || "A"}
            </div>

            {!menuReduit && (
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
            )}
          </button>


          <div className="notifications-container">
            <button
              type="button"
              className="bouton-notifications"
              onClick={() =>
                setNotificationsOuvertes((ouvert) => !ouvert)
              }
              aria-label="Ouvrir les notifications"
              aria-expanded={notificationsOuvertes}
              title={menuReduit ? "Notifications" : undefined}
            >
              <span className="icone-cloche">
                <Icon name="bell" />
              </span>

              {!menuReduit && <span>Notifications</span>}

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
            title={menuReduit ? "Déconnexion" : undefined}
          >
            <Icon name="logout" />
            {!menuReduit && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Menu;
