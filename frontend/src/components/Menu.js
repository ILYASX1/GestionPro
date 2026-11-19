
function Menu({ pageActive, changerPage, utilisateur, deconnecter }) {
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
