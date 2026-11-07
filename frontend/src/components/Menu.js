
function Menu({ pageActive, changerPage, utilisateur, deconnecter }) {
  const pages = [
    { id: "Accueil", nom: "Accueil" },
    { id: "Clients", nom: "Clients" },
    { id: "Factures", nom: "Factures" },
    { id: "Devis", nom: "Devis" },
    { id: "Paiements", nom: "Paiements" },
    { id: "Relances", nom: "Relances" },
  ];

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
            className={pageActive === page.id ? "lien actif" : "lien"}
            onClick={() => changerPage(page.id)}
          >
            {page.nom}
          </button>
        ))}
      </div>

      <div className="menu-utilisateur">
        <span className="utilisateur-nom">
          {utilisateur?.nom}
        </span>

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
