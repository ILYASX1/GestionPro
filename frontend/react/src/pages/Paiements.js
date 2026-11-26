import { useState } from "react";
import { exporterDocumentPDF } from "../utils/exportPdf";

function Paiements({
  paiements,
  factures,
  clients,
  ajouterPaiement,
  modifierPaiement,
  supprimerPaiement,
  lectureSeule = false,
}) {
  const [factureId, setFactureId] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState("Espèces");
  const [paiementEnCours, setPaiementEnCours] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [filtreMode, setFiltreMode] = useState("tous");
  const [pageActuelle, setPageActuelle] = useState(1);

  const paiementsParPage = 5;

  function formaterMontant(valeur) {
    return `${Number(valeur || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} DH`;
  }

  function totalPaye(factureId, paiementIgnoreId = null) {
    return paiements
      .filter(
        (paiement) =>
          paiement.factureId === factureId &&
          paiement.id !== paiementIgnoreId
      )
      .reduce(
        (total, paiement) => total + Number(paiement.montant || 0),
        0
      );
  }

  function montantRestant(facture, paiementIgnoreId = null) {
    if (!facture) return 0;

    return Math.max(
      0,
      Number(facture.montant || 0) -
        totalPaye(facture.id, paiementIgnoreId)
    );
  }

  function informationsClient(facture) {
    if (facture?.clientSnapshot) {
      return {
        nom: facture.clientSnapshot.nom || "Client inconnu",
        email: facture.clientSnapshot.email || "Non renseigné",
        telephone:
          facture.clientSnapshot.telephone || "Non renseigné",
      };
    }

    const client = clients.find(
      (item) => item.id === facture?.clientId
    );

    return {
      nom: client?.nom || "Client inconnu",
      email: client?.email || "Non renseigné",
      telephone: client?.telephone || "Non renseigné",
    };
  }

  function nomClient(facture) {
    return informationsClient(facture).nom;
  }

  const facturesEnAttente = factures.filter(
    (facture) => montantRestant(facture) > 0
  );

  const factureSelectionnee = paiementEnCours
    ? factures.find(
        (facture) => facture.id === paiementEnCours.factureId
      )
    : factures.find(
        (facture) => facture.id === Number(factureId)
      );

  const totalDejaPaye = factureSelectionnee
    ? totalPaye(
        factureSelectionnee.id,
        paiementEnCours?.id || null
      )
    : 0;

  const montantMaximum = factureSelectionnee
    ? montantRestant(
        factureSelectionnee,
        paiementEnCours?.id || null
      )
    : 0;

  function reinitialiserFormulaire() {
    setFactureId("");
    setMontant("");
    setDate(new Date().toISOString().slice(0, 10));
    setMode("Espèces");
    setPaiementEnCours(null);
  }

  function gererPaiement(e) {
    e.preventDefault();

    if (lectureSeule) return;

    const montantSaisi = Number(montant);

    if (!date || !Number.isFinite(montantSaisi) || montantSaisi <= 0) {
      alert("Veuillez saisir un montant valide et une date.");
      return;
    }

    if (!factureSelectionnee) {
      alert("Veuillez choisir une facture valide.");
      return;
    }

    if (montantSaisi > montantMaximum) {
      alert(
        `Le montant dépasse le reste à payer. Montant maximum : ${formaterMontant(
          montantMaximum
        )}.`
      );
      return;
    }

    if (paiementEnCours) {
      modifierPaiement(paiementEnCours.id, {
        montant: montantSaisi,
        date,
        mode,
      });

      reinitialiserFormulaire();
      return;
    }

    ajouterPaiement({
      id: Date.now(),
      factureId: factureSelectionnee.id,
      montant: montantSaisi,
      date,
      mode,
    });

    reinitialiserFormulaire();
    setPageActuelle(1);
  }

  function commencerModification(paiement) {
    if (lectureSeule) return;

    setPaiementEnCours(paiement);
    setFactureId(String(paiement.factureId));
    setMontant(String(paiement.montant));
    setDate(paiement.date);
    setMode(paiement.mode);
  }

  function gererSuppression(paiement) {
    if (lectureSeule) return;

    const facture = factures.find(
      (item) => item.id === paiement.factureId
    );

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le paiement de ${
        facture?.numero || "cette facture"
      } ?`
    );

    if (!confirmation) return;

    supprimerPaiement(paiement.id);

    if (paiementEnCours?.id === paiement.id) {
      reinitialiserFormulaire();
    }
  }

  function exporterPaiementPDF(paiement) {
    const facture = factures.find(
      (item) => item.id === paiement.factureId
    );

    const client = informationsClient(facture);

    const totalVerse = facture
      ? totalPaye(facture.id)
      : Number(paiement.montant || 0);

    const reste = facture
      ? montantRestant(facture)
      : null;

    exporterDocumentPDF({
      titre: "Reçu de paiement",
      numero: `PAY-${paiement.id}`,
      description: "Justificatif d'enregistrement d'un paiement.",
      nomFichier: `recu-paiement-${paiement.id}`,
      sections: [
        {
          titre: "Détails du paiement",
          champs: [
            {
              label: "Référence du reçu",
              valeur: `PAY-${paiement.id}`,
            },
            {
              label: "Date du paiement",
              valeur: paiement.date,
            },
            {
              label: "Montant reçu",
              valeur: formaterMontant(paiement.montant),
            },
            {
              label: "Mode de paiement",
              valeur: paiement.mode,
            },
          ],
        },
        {
          titre: "Facture associée",
          champs: [
            {
              label: "Numéro de facture",
              valeur: facture?.numero || "Inconnue",
            },
            {
              label: "Montant de la facture",
              valeur: facture
                ? formaterMontant(facture.montant)
                : "—",
            },
            {
              label: "Total payé sur la facture",
              valeur: facture ? formaterMontant(totalVerse) : "—",
            },
            {
              label: "Reste à payer",
              valeur: reste === null ? "—" : formaterMontant(reste),
            },
          ],
        },
        {
          titre: "Informations du client",
          champs: [
            { label: "Nom", valeur: client.nom },
            { label: "Email", valeur: client.email },
            { label: "Téléphone", valeur: client.telephone },
          ],
        },
      ],
    });
  }

  const paiementsFiltres = paiements.filter((paiement) => {
    const terme = recherche.trim().toLowerCase();

    const facture = factures.find(
      (item) => item.id === paiement.factureId
    );

    const correspondRecherche = [
      facture?.numero,
      nomClient(facture),
      paiement.date,
      paiement.mode,
      paiement.montant,
    ]
      .join(" ")
      .toLowerCase()
      .includes(terme);

    const correspondMode =
      filtreMode === "tous" || paiement.mode === filtreMode;

    return correspondRecherche && correspondMode;
  });

  const nombrePages = Math.ceil(
    paiementsFiltres.length / paiementsParPage
  );

  const pageValide = Math.min(
    pageActuelle,
    Math.max(nombrePages, 1)
  );

  const indiceDebut = (pageValide - 1) * paiementsParPage;

  const paiementsAffiches = paiementsFiltres.slice(
    indiceDebut,
    indiceDebut + paiementsParPage
  );
  return (
    <section>
      <h1>Gestion des paiements</h1>

      <p className="sous-titre">
        {lectureSeule
          ? "Consultez tous les paiements de l'entreprise."
          : "Enregistrez, modifiez et consultez les paiements de vos clients."}
      </p>

      {lectureSeule && (
        <p className="message-info">
          Mode consultation : vous ne pouvez pas modifier les paiements.
        </p>
      )}

      {!lectureSeule && (
        <div className="carte">
          <h2>
            {paiementEnCours
              ? "Modifier un paiement"
              : "Enregistrer un paiement"}
          </h2>

          {!paiementEnCours && facturesEnAttente.length === 0 ? (
            <p>Aucune facture en attente de paiement.</p>
          ) : (
            <form onSubmit={gererPaiement} className="formulaire">
              {paiementEnCours ? (
                <div>
                  <label>Facture associée</label>
                  <p>
                    {factureSelectionnee
                      ? `${factureSelectionnee.numero} — ${nomClient(
                          factureSelectionnee
                        )}`
                      : "Facture introuvable"}
                  </p>
                </div>
              ) : (
                <>
                  <label htmlFor="paiement-facture">
                    Facture associée
                  </label>

                  <select
                    id="paiement-facture"
                    value={factureId}
                    onChange={(e) => {
                      setFactureId(e.target.value);

                      const facture = factures.find(
                        (item) => item.id === Number(e.target.value)
                      );

                      setMontant(
                        facture
                          ? String(montantRestant(facture))
                          : ""
                      );
                    }}
                    required
                  >
                    <option value="">Choisir une facture</option>

                    {facturesEnAttente.map((facture) => (
                      <option key={facture.id} value={facture.id}>
                        {facture.numero} — {nomClient(facture)} — Reste :{" "}
                        {formaterMontant(montantRestant(facture))}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {factureSelectionnee && (
                <div className="carte">
                  <h3>Situation de la facture</h3>

                  <p>
                    <strong>Facture :</strong>{" "}
                    {factureSelectionnee.numero}
                  </p>

                  <p>
                    <strong>Client :</strong>{" "}
                    {nomClient(factureSelectionnee)}
                  </p>

                  <p>
                    <strong>Montant total :</strong>{" "}
                    {formaterMontant(factureSelectionnee.montant)}
                  </p>

                  <p>
                    <strong>Montant déjà payé :</strong>{" "}
                    {formaterMontant(totalDejaPaye)}
                  </p>

                  <p>
                    <strong>Reste à payer :</strong>{" "}
                    {formaterMontant(montantMaximum)}
                  </p>

                  <p>
                    <strong>Statut :</strong>{" "}
                    {montantMaximum === 0
                      ? "Payée"
                      : totalDejaPaye > 0
                        ? "Partiellement payée"
                        : "En attente"}
                  </p>
                </div>
              )}

              <label htmlFor="paiement-montant">
                Montant du paiement (DH)
              </label>

              <input
                id="paiement-montant"
                type="number"
                min="0.01"
                max={montantMaximum}
                step="0.01"
                placeholder="Montant en DH"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                required
              />

              <label htmlFor="paiement-date">Date du paiement</label>

              <input
                id="paiement-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <label htmlFor="paiement-mode">Mode de paiement</label>

              <select
                id="paiement-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                required
              >
                <option value="Espèces">Espèces</option>
                <option value="Virement">Virement</option>
                <option value="Carte bancaire">Carte bancaire</option>
                <option value="Chèque">Chèque</option>
              </select>

              <button type="submit" className="bouton">
                {paiementEnCours
                  ? "Enregistrer les modifications"
                  : "Enregistrer le paiement"}
              </button>

              {paiementEnCours && (
                <button
                  type="button"
                  className="bouton petit"
                  onClick={reinitialiserFormulaire}
                >
                  Annuler
                </button>
              )}
            </form>
          )}
        </div>
      )}

      <div className="carte">
        <h2>
          Historique des paiements ({paiementsFiltres.length})
        </h2>

        <div className="recherche-container">
          <input
            type="search"
            placeholder="Rechercher par facture, client, date, mode ou montant..."
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value);
              setPageActuelle(1);
            }}
          />

          {recherche && (
            <button
              type="button"
              className="bouton petit"
              onClick={() => {
                setRecherche("");
                setPageActuelle(1);
              }}
            >
              Effacer
            </button>
          )}
        </div>

        <div className="formulaire">
          <label htmlFor="filtreMode">
            Filtrer par mode de paiement :
          </label>

          <select
            id="filtreMode"
            value={filtreMode}
            onChange={(e) => {
              setFiltreMode(e.target.value);
              setPageActuelle(1);
            }}
          >
            <option value="tous">Tous les modes</option>
            <option value="Espèces">Espèces</option>
            <option value="Virement">Virement</option>
            <option value="Carte bancaire">Carte bancaire</option>
            <option value="Chèque">Chèque</option>
          </select>
        </div>

        <p className="sous-titre">
          {paiementsFiltres.length} paiement(s) trouvé(s)
        </p>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Facture</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Mode</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paiementsAffiches.map((paiement) => {
                const facture = factures.find(
                  (item) => item.id === paiement.factureId
                );

                return (
                  <tr key={paiement.id}>
                    <td>{facture?.numero || "Inconnue"}</td>
                    <td>{nomClient(facture)}</td>
                    <td>{formaterMontant(paiement.montant)}</td>
                    <td>{paiement.date}</td>
                    <td>{paiement.mode}</td>
                    <td>
                      <div className="actions-facture">
                        <button
                          type="button"
                          className="bouton petit bouton-pdf"
                          onClick={() => exporterPaiementPDF(paiement)}
                        >
                          PDF
                        </button>

                        {!lectureSeule && (
                          <>
                            <button
                              type="button"
                              className="bouton petit"
                              onClick={() =>
                                commencerModification(paiement)
                              }
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              className="bouton petit bouton-danger"
                              onClick={() =>
                                gererSuppression(paiement)
                              }
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paiementsFiltres.length === 0 && (
                <tr>
                  <td colSpan="6">
                    {paiements.length === 0
                      ? "Aucun paiement enregistré."
                      : "Aucun paiement ne correspond à votre recherche ou à votre filtre."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {nombrePages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="bouton petit"
              disabled={pageValide === 1}
              onClick={() => setPageActuelle(pageValide - 1)}
            >
              Précédent
            </button>

            <span>
              Page {pageValide} sur {nombrePages}
            </span>

            <button
              type="button"
              className="bouton petit"
              disabled={pageValide === nombrePages}
              onClick={() => setPageActuelle(pageValide + 1)}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Paiements;