
function Accueil({ clients, factures, devis, paiements }) {
  // FONCTIONS UTILITAIRES

  function convertirEnNombre(valeur) {
    const nombre = Number(valeur);
    return Number.isFinite(nombre) ? nombre : 0;
  }

  function lireDate(date) {
    if (!date) return null;

    if (date instanceof Date) {
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const valeur = String(date).trim();
    let resultat;

    // Format JJ/MM/AAAA
    const dateFrancaise = valeur.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (dateFrancaise) {
      resultat = new Date(
        Number(dateFrancaise[3]),
        Number(dateFrancaise[2]) - 1,
        Number(dateFrancaise[1])
      );

      if (
        resultat.getFullYear() !== Number(dateFrancaise[3]) ||
        resultat.getMonth() !== Number(dateFrancaise[2]) - 1 ||
        resultat.getDate() !== Number(dateFrancaise[1])
      ) {
        return null;
      }

      return resultat;
    }

    // Format AAAA-MM-JJ
    const dateISO = valeur.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (dateISO) {
      resultat = new Date(
        Number(dateISO[1]),
        Number(dateISO[2]) - 1,
        Number(dateISO[3])
      );

      if (
        resultat.getFullYear() !== Number(dateISO[1]) ||
        resultat.getMonth() !== Number(dateISO[2]) - 1 ||
        resultat.getDate() !== Number(dateISO[3])
      ) {
        return null;
      }

      return resultat;
    }

    resultat = new Date(valeur);

    return Number.isNaN(resultat.getTime()) ? null : resultat;
  }

  function formaterMontant(montant) {
    return `${convertirEnNombre(montant).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} DH`;
  }

  // CALCUL DES MONTANTS

  const montantTotalFactures = factures.reduce(
    (total, facture) =>
      total + Math.max(0, convertirEnNombre(facture.montant)),
    0
  );

  const chiffreAffaires = paiements.reduce(
    (total, paiement) =>
      total + Math.max(0, convertirEnNombre(paiement.montant)),
    0
  );

  // CALCUL DES STATUTS DES FACTURES

  const facturesAvecPaiements = factures.map((facture) => {
    const totalPaye = paiements
      .filter(
        (paiement) =>
          String(paiement.factureId) === String(facture.id)
      )
      .reduce(
        (total, paiement) =>
          total + Math.max(0, convertirEnNombre(paiement.montant)),
        0
      );

    const montantFacture = Math.max(
      0,
      convertirEnNombre(facture.montant)
    );

    const montantRestant = Math.max(
      0,
      montantFacture - totalPaye
    );

    let statutCalcule = "En attente";

    if (montantFacture > 0 && montantRestant === 0) {
      statutCalcule = "Payée";
    } else if (totalPaye > 0) {
      statutCalcule = "Partiellement payée";
    }

    return {
      ...facture,
      totalPaye,
      montantRestant,
      statutCalcule,
    };
  });

  const montantImpaye = facturesAvecPaiements.reduce(
    (total, facture) => total + facture.montantRestant,
    0
  );

  const tauxPaiement =
    montantTotalFactures > 0
      ? Math.min(
          100,
          (chiffreAffaires / montantTotalFactures) * 100
        )
      : 0;

  const nombreFacturesPayees = facturesAvecPaiements.filter(
    (facture) => facture.statutCalcule === "Payée"
  ).length;

  const nombreFacturesPartiellementPayees =
    facturesAvecPaiements.filter(
      (facture) =>
        facture.statutCalcule === "Partiellement payée"
    ).length;

  const nombreFacturesEnAttente = facturesAvecPaiements.filter(
    (facture) => facture.statutCalcule === "En attente"
  ).length;

  // FACTURES EN RETARD

  const aujourdHui = new Date();
  aujourdHui.setHours(0, 0, 0, 0);

  const facturesEnRetard = facturesAvecPaiements.filter(
    (facture) => {
      if (!facture.dateEcheance || facture.montantRestant <= 0) {
        return false;
      }

      const echeance = lireDate(facture.dateEcheance);

      if (!echeance) return false;

      echeance.setHours(0, 0, 0, 0);

      return echeance < aujourdHui;
    }
  );

  // STATISTIQUES PRINCIPALES

  const statistiques = [
    {
      titre: "Clients",
      valeur: clients.length,
    },
    {
      titre: "Factures",
      valeur: factures.length,
    },
    {
      titre: "Devis",
      valeur: devis.length,
    },
    {
      titre: "Factures impayées",
      valeur:
        nombreFacturesEnAttente +
        nombreFacturesPartiellementPayees,
    },
  ];

  // ÉVOLUTION DES PAIEMENTS SUR LES 6 DERNIERS MOIS

  const moisLabels = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const sixDerniersMois = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);

    sixDerniersMois.push({
      mois: date.getMonth(),
      annee: date.getFullYear(),
      label: moisLabels[date.getMonth()],
      montant: 0,
    });
  }

  paiements.forEach((paiement) => {
    const datePaiement = lireDate(paiement.date);

    if (!datePaiement) return;

    const moisCorrespondant = sixDerniersMois.find(
      (item) =>
        item.mois === datePaiement.getMonth() &&
        item.annee === datePaiement.getFullYear()
    );

    if (moisCorrespondant) {
      moisCorrespondant.montant += Math.max(
        0,
        convertirEnNombre(paiement.montant)
      );
    }
  });

  const montantMaximumMois = Math.max(
    ...sixDerniersMois.map((item) => item.montant),
    1
  );

  // LES CINQ DERNIÈRES FACTURES

  const dernieresFactures = [...factures]
    .sort((a, b) => {
      const dateA = lireDate(a.date);
      const dateB = lireDate(b.date);

      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    })
    .slice(0, 5);

  // AFFICHAGE

  return (
    <section>
      <h1>Tableau de bord</h1>

      <p className="sous-titre">
        Bienvenue dans votre espace de gestion.
      </p>

      {/* STATISTIQUES PRINCIPALES */}

      <div className="statistiques">
        {statistiques.map((stat) => (
          <div className="carte-stat" key={stat.titre}>
            <p>{stat.titre}</p>
            <h2>{stat.valeur}</h2>
          </div>
        ))}
      </div>

      {/* INDICATEURS FINANCIERS */}

      <div className="statistiques">
        <div className="carte-stat">
          <p>Chiffre d'affaires encaissé</p>
          <h2>{formaterMontant(chiffreAffaires)}</h2>
        </div>

        <div className="carte-stat">
          <p>Montant restant à encaisser</p>
          <h2>{formaterMontant(montantImpaye)}</h2>
        </div>

        <div className="carte-stat">
          <p>Taux de paiement</p>
          <h2>{tauxPaiement.toFixed(1)} %</h2>
        </div>

        <div className="carte-stat">
          <p>Factures en retard</p>
          <h2>{facturesEnRetard.length}</h2>
        </div>
      </div>

      {/* RÉPARTITION DES FACTURES */}

      <div className="carte">
        <h2>Répartition des factures</h2>

        <div className="statistiques">
          <div className="carte-stat">
            <p>Payées</p>
            <h2>{nombreFacturesPayees}</h2>
          </div>

          <div className="carte-stat">
            <p>Partiellement payées</p>
            <h2>{nombreFacturesPartiellementPayees}</h2>
          </div>

          <div className="carte-stat">
            <p>En attente</p>
            <h2>{nombreFacturesEnAttente}</h2>
          </div>
        </div>
      </div>

      {/* ÉVOLUTION DES PAIEMENTS */}

      <div className="carte">
        <h2>Évolution des paiements</h2>

        <p className="sous-titre">
          Montants encaissés au cours des six derniers mois.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            gap: "12px",
            minHeight: "220px",
            padding: "20px 10px",
            borderBottom: "1px solid #ddd",
          }}
        >
          {sixDerniersMois.map((item) => (
            <div
              key={`${item.annee}-${item.mois}`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                height: "190px",
                gap: "8px",
              }}
            >
              <small style={{ fontSize: "11px", textAlign: "center" }}>
                {item.montant.toLocaleString("fr-FR")} DH
              </small>

              <div
                title={formaterMontant(item.montant)}
                style={{
                  width: "100%",
                  maxWidth: "55px",
                  height: `${
                    item.montant > 0
                      ? Math.max(
                          5,
                          (item.montant / montantMaximumMois) * 140
                        )
                      : 3
                  }px`,
                  backgroundColor: "#3b82f6",
                  borderRadius: "5px 5px 0 0",
                  transition: "height 0.3s ease",
                }}
              />

              <small style={{ fontSize: "11px" }}>
                {item.label.slice(0, 3)} {String(item.annee).slice(-2)}
              </small>
            </div>
          ))}
        </div>
      </div>

      {/* DERNIÈRES FACTURES */}

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
              {dernieresFactures.map((facture) => {
                const factureCalculee = facturesAvecPaiements.find(
                  (item) => String(item.id) === String(facture.id)
                );

                const statut =
                  factureCalculee?.statutCalcule || facture.statut;

                let classeStatut = "badge attente";

                if (statut === "Payée") {
                  classeStatut = "badge payee";
                } else if (statut === "Partiellement payée") {
                  classeStatut = "badge partielle";
                }

                return (
                  <tr key={facture.id}>
                    <td>{facture.numero}</td>
                    <td>{formaterMontant(facture.montant)}</td>
                    <td>{facture.date}</td>
                    <td>
                      <span className={classeStatut}>
                        {statut}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {factures.length === 0 && (
                <tr>
                  <td colSpan="4">
                    Aucune facture disponible.
                  </td>
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
