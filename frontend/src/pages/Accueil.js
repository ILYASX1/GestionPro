
function Accueil({ clients, factures, devis }) {
  const facturesImpayees = factures.filter(
    (facture) => facture.statut !== "Payée"
  );

  const montantImpaye = facturesImpayees.reduce(
    (total, facture) => total + Number(facture.montant),
    0
  );

  const statistiques = [
    { titre: "Clients", valeur: clients.length },
    { titre: "Factures", valeur: factures.length },
    { titre: "Devis", valeur: devis.length },
    { titre: "Factures impayées", valeur: facturesImpayees.length },
  ];

  return (
    <section>
      <h1>Tableau de bord</h1>
      <p className="sous-titre">
        Bienvenue dans votre espace de gestion.
      </p>

      <div className="statistiques">
        {statistiques.map((stat) => (
          <div className="carte-stat" key={stat.titre}>
            <p>{stat.titre}</p>
            <h2>{stat.valeur}</h2>
          </div>
        ))}
      </div>

      <div className="carte">
        <h2>Montant restant à encaisser</h2>
        <p className="montant">
          {montantImpaye.toLocaleString("fr-FR")} DH
        </p>
      </div>

      <div className="carte">
        <h2>Dernières factures</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {factures.slice(-5).reverse().map((facture) => (
                <tr key={facture.id}>
                  <td>{facture.numero}</td>
                  <td>{facture.montant} DH</td>
                  <td>{facture.date}</td>
                  <td>
                    <span
                      className={
                        facture.statut === "Payée"
                          ? "badge payee"
                          : "badge attente"
                      }
                    >
                      {facture.statut}
                    </span>
                  </td>
                </tr>
              ))}

              {factures.length === 0 && (
                <tr>
                  <td colSpan="4">Aucune facture disponible.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Accueil;
