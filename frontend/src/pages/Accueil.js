
function Icone({ type }) {
  const paths = {
    clients: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    factures: (
      <>
        <path d="M6 2h12v20l-3-2-3 2-3-2-3 2z" />
        <path d="M9 8h6M9 12h6M9 16h3" />
      </>
    ),
    devis: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" />
      </>
    ),
    unpaid: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2M12 3v1M12 20v1" />
      </>
    ),
    revenue: (
      <>
        <path d="M3 17l6-6 4 4 8-9" />
        <path d="M15 6h6v6" />
      </>
    ),
    balance: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 9h18M16 14h.01" />
      </>
    ),
    rate: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="m7 14 4-4 3 2 5-6" />
      </>
    ),
    overdue: (
      <>
        <path d="M12 3 2.8 19h18.4L12 3z" />
        <path d="M12 9v4M12 16h.01" />
      </>
    ),
    arrow: (
      <>
        <path d="M7 17 17 7M7 7h10v10" />
      </>
    ),
  };

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

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
      icone: "clients",
      couleur: "violet",
      description: "Clients enregistrés",
    },
    {
      titre: "Factures",
      valeur: factures.length,
      icone: "factures",
      couleur: "blue",
      description: "Factures créées",
    },
    {
      titre: "Devis",
      valeur: devis.length,
      icone: "devis",
      couleur: "orange",
      description: "Devis enregistrés",
    },
    {
      titre: "Factures impayées",
      valeur:
        nombreFacturesEnAttente +
        nombreFacturesPartiellementPayees,
      icone: "unpaid",
      couleur: "red",
      description: "À suivre",
    },
  ];

  // INDICATEURS FINANCIERS

  const indicateurs = [
    {
      titre: "Chiffre d'affaires encaissé",
      valeur: formaterMontant(chiffreAffaires),
      icone: "revenue",
      couleur: "green",
      description: "Total des paiements reçus",
    },
    {
      titre: "Montant restant à encaisser",
      valeur: formaterMontant(montantImpaye),
      icone: "balance",
      couleur: "orange",
      description: "Montant encore impayé",
    },
    {
      titre: "Taux de paiement",
      valeur: `${tauxPaiement.toFixed(1)} %`,
      icone: "rate",
      couleur: "blue",
      description: "Sur le montant total facturé",
    },
    {
      titre: "Factures en retard",
      valeur: facturesEnRetard.length,
      icone: "overdue",
      couleur: "red",
      description: "Échéance dépassée",
    },
  ];

  // RÉPARTITION DES FACTURES

  const totalFacturesPourRepartition = Math.max(
    factures.length,
    1
  );

  const repartitionFactures = [
    {
      titre: "Payées",
      nombre: nombreFacturesPayees,
      couleur: "green",
      pourcentage:
        (nombreFacturesPayees / totalFacturesPourRepartition) * 100,
    },
    {
      titre: "Partiellement payées",
      nombre: nombreFacturesPartiellementPayees,
      couleur: "orange",
      pourcentage:
        (nombreFacturesPartiellementPayees /
          totalFacturesPourRepartition) *
        100,
    },
    {
      titre: "En attente",
      nombre: nombreFacturesEnAttente,
      couleur: "red",
      pourcentage:
        (nombreFacturesEnAttente / totalFacturesPourRepartition) * 100,
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

  // COORDONNÉES DU GRAPHIQUE LINÉAIRE

  const graphiquePoints = sixDerniersMois.map((item, index) => ({
    x: 42 + index * 127.2,
    y: 190 - (item.montant / montantMaximumMois) * 145,
    ...item,
  }));

  const courbePaiements = graphiquePoints.reduce(
    (chemin, point, index, points) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const precedent = points[index - 1];
      const distanceX = point.x - precedent.x;

      return (
        `${chemin} C ` +
        `${precedent.x + distanceX / 3} ${precedent.y}, ` +
        `${point.x - distanceX / 3} ${point.y}, ` +
        `${point.x} ${point.y}`
      );
    },
    ""
  );

  const airePaiements =
    `${courbePaiements} L ${graphiquePoints[graphiquePoints.length - 1].x} 198 ` +
    `L ${graphiquePoints[0].x} 198 Z`;

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
    <section className="dashboard">
      <div className="dashboard-entete">
        <div>
          <span className="dashboard-sur-titre">
            VOTRE ACTIVITÉ
          </span>
          <h1>Tableau de bord</h1>
          <p className="sous-titre">
            Bienvenue dans votre espace de gestion. Voici un aperçu de votre activité.
          </p>
        </div>

        <div className="dashboard-date">
          <span className="dashboard-date-label">Aujourd'hui</span>
          <strong>
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </strong>
        </div>
      </div>

      {/* APERÇU GÉNÉRAL */}

      <div className="dashboard-section-entete">
        <div>
          <h2>Vue d'ensemble</h2>
          <p>Les indicateurs principaux de votre activité.</p>
        </div>
      </div>

      <div className="dashboard-grille-statistiques">
        {statistiques.map((stat) => (
          <article
            className={`dashboard-stat-card ${stat.couleur}`}
            key={stat.titre}
          >
            <div className="dashboard-stat-haut">
              <div className="dashboard-stat-icone">
                <Icone type={stat.icone} />
              </div>
              <span className="dashboard-stat-indicateur">
                <Icone type="arrow" />
              </span>
            </div>

            <div className="dashboard-stat-bas">
              <p>{stat.titre}</p>
              <h3>{stat.valeur}</h3>
              <small>{stat.description}</small>
            </div>
          </article>
        ))}
      </div>

      {/* INDICATEURS FINANCIERS */}

      <div className="dashboard-section-entete dashboard-section-finance">
        <div>
          <h2>Situation financière</h2>
          <p>Suivez les encaissements et les montants à recevoir.</p>
        </div>
      </div>

      <div className="dashboard-grille-finance">
        {indicateurs.map((indicateur) => (
          <article
            className={`dashboard-finance-card ${indicateur.couleur}`}
            key={indicateur.titre}
          >
            <div className="dashboard-finance-entete">
              <div className="dashboard-finance-icone">
                <Icone type={indicateur.icone} />
              </div>
              <span>{indicateur.titre}</span>
            </div>

            <h3>{indicateur.valeur}</h3>
            <p>{indicateur.description}</p>

            {indicateur.icone === "rate" && (
              <div className="dashboard-progress-simple">
                <span style={{ width: `${tauxPaiement}%` }} />
              </div>
            )}
          </article>
        ))}
      </div>

      {/* RÉPARTITION DES FACTURES */}

      <div className="dashboard-panel">
        <div className="dashboard-panel-entete">
          <div>
            <h2>Répartition des factures</h2>
            <p>État actuel de vos factures.</p>
          </div>
          <span className="dashboard-total-badge">
            {factures.length} facture(s)
          </span>
        </div>

        <div className="dashboard-repartition">
          {repartitionFactures.map((item) => (
            <article
              className={`dashboard-repartition-card ${item.couleur}`}
              key={item.titre}
            >
              <div className="dashboard-repartition-haut">
                <span className="dashboard-repartition-point" />
                <span>{item.titre}</span>
              </div>

              <strong>{item.nombre}</strong>

              <div className="dashboard-repartition-barre">
                <span style={{ width: `${item.pourcentage}%` }} />
              </div>

              <small>{item.pourcentage.toFixed(0)} % des factures</small>
            </article>
          ))}
        </div>
      </div>

      {/* ÉVOLUTION DES PAIEMENTS */}

      <div className="dashboard-panel">
        <div className="dashboard-panel-entete">
          <div>
            <h2>Évolution des paiements</h2>
            <p>Montants encaissés au cours des six derniers mois.</p>
          </div>

          <span className="dashboard-chart-badge">
            6 derniers mois
          </span>
        </div>

        <div className="dashboard-graphique dashboard-graphique-ligne">
          <svg
            className="dashboard-line-svg"
            viewBox="0 0 720 215"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Évolution des paiements sur six mois"
          >
            <defs>
              <linearGradient
                id="paiementsAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#536FE8" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#536FE8" stopOpacity="0.015" />
              </linearGradient>
            </defs>

            {[45, 95, 145, 195].map((y) => (
              <line
                key={y}
                x1="18"
                y1={y}
                x2="702"
                y2={y}
                className="dashboard-line-grid"
              />
            ))}

            <path d={airePaiements} fill="url(#paiementsAreaGradient)" />

            <path
              d={courbePaiements}
              className="dashboard-line-path"
            />

            {graphiquePoints.map((point) => (
              <g key={`${point.annee}-${point.mois}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="9"
                  className="dashboard-line-point-halo"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4.5"
                  className="dashboard-line-point"
                />
                <text
                  x={point.x}
                  y={Math.max(23, point.y - 17)}
                  textAnchor="middle"
                  className="dashboard-line-value"
                >
                  {formaterMontant(point.montant)}
                </text>
                <title>
                  {`${point.label} ${point.annee} : ${formaterMontant(point.montant)}`}
                </title>
              </g>
            ))}
          </svg>

          <div className="dashboard-line-months">
            {sixDerniersMois.map((item) => (
              <span key={`${item.annee}-${item.mois}`}>
                {item.label.slice(0, 3)} {String(item.annee).slice(-2)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DERNIÈRES FACTURES */}

      <div className="dashboard-panel dashboard-panel-factures">
        <div className="dashboard-panel-entete">
          <div>
            <h2>Dernières factures</h2>
            <p>Les cinq factures les plus récentes.</p>
          </div>

          <span className="dashboard-total-badge">
            {factures.length} au total
          </span>
        </div>

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
                    <td>
                      <strong className="dashboard-numero-facture">
                        {facture.numero}
                      </strong>
                    </td>
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
                  <td colSpan="4" className="dashboard-vide">
                    Aucune facture disponible pour le moment.
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
