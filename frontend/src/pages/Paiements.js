
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

  function totalPaye(factureId, paiementIgnoreId = null) {
    return paiements
      .filter(
        (p) =>
          p.factureId === factureId &&
          p.id !== paiementIgnoreId
      )
      .reduce((total, p) => total + Number(p.montant), 0);
  }

  function montantRestant(facture) {
    return Math.max(
      0,
      Number(facture.montant) - totalPaye(facture.id)
    );
  }

  const facturesEnAttente = factures.filter(
    (facture) => montantRestant(facture) > 0
  );

  const factureSelectionnee = paiementEnCours
    ? factures.find((f) => f.id === paiementEnCours.factureId)
    : factures.find((f) => f.id === Number(factureId));

  const montantMaximum = factureSelectionnee
    ? paiementEnCours
      ? Math.max(
          0,
          Number(factureSelectionnee.montant) -
            totalPaye(factureSelectionnee.id, paiementEnCours.id)
        )
      : montantRestant(factureSelectionnee)
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

    if (montantSaisi > montantMaximum) {
      alert(
        `Le montant dépasse le reste à payer. Montant maximum : ${montantMaximum} DH.`
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

    const facture = factures.find(
      (f) => f.id === Number(factureId)
    );

    if (!facture) {
      alert("Veuillez choisir une facture valide.");
      return;
    }

    ajouterPaiement({
      id: Date.now(),
      factureId: facture.id,
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
      (f) => f.id === paiement.factureId
    );

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le paiement de ${
        facture ? facture.numero : "cette facture"
      } ?`
    );

    if (!confirmation) return;

    supprimerPaiement(paiement.id);

    if (paiementEnCours?.id === paiement.id) {
      reinitialiserFormulaire();
    }
  }

  function nomClient(id) {
    const client = clients.find((c) => c.id === id);
    return client ? client.nom : "Client inconnu";
  }

  function exporterPaiementPDF(paiement) {
    const facture = factures.find((f) => f.id === paiement.factureId);

    const client = facture
      ? clients.find((c) => c.id === facture.clientId)
      : null;

    const totalVerse = facture
      ? totalPaye(facture.id)
      : Number(paiement.montant || 0);

    const reste = facture
      ? Math.max(0, Number(facture.montant || 0) - totalVerse)
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
              valeur: `${Number(paiement.montant || 0).toLocaleString("fr-FR")} DH`,
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
                ? `${Number(facture.montant || 0).toLocaleString("fr-FR")} DH`
                : "—",
            },
            {
              label: "Total payé sur la facture",
              valeur: facture
                ? `${totalVerse.toLocaleString("fr-FR")} DH`
                : "—",
            },
            {
              label: "Reste à payer",
              valeur: reste === null
                ? "—"
                : `${reste.toLocaleString("fr-FR")} DH`,
            },
          ],
        },
        {
          titre: "Informations du client",
          champs: [
            { label: "Nom", valeur: client?.nom || "Client inconnu" },
            { label: "Email", valeur: client?.email || "Non renseigné" },
            {
              label: "Téléphone",
              valeur: client?.telephone || "Non renseigné",
            },
          ],
        },
      ],
    });
  }

  const paiementsFiltres = paiements.filter((paiement) => {
    const terme = recherche.trim().toLowerCase();

    const facture = factures.find(
      (f) => f.id === paiement.factureId
    );

    const numeroFacture = facture
      ? String(facture.numero || "").toLowerCase()
      : "";

    const client = facture
      ? nomClient(facture.clientId).toLowerCase()
      : "";

    const datePaiement = String(paiement.date || "").toLowerCase();
    const modePaiement = String(paiement.mode || "").toLowerCase();
    const montantPaiement = String(paiement.montant || "").toLowerCase();

    const correspondRecherche =
      numeroFacture.includes(terme) ||
      client.includes(terme) ||
      datePaiement.includes(terme) ||
      modePaiement.includes(terme) ||
      montantPaiement.includes(terme);

    const correspondMode =
      filtreMode === "tous" ||
      paiement.mode === filtreMode;

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
  const indiceFin = indiceDebut + paiementsParPage;

  const paiementsAffiches = paiementsFiltres.slice(
    indiceDebut,
    indiceFin
  );

  function changerRecherche(e) {
    setRecherche(e.target.value);
    setPageActuelle(1);
  }

  function changerFiltre(e) {
    setFiltreMode(e.target.value);
    setPageActuelle(1);
  }

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
          Mode consultation : vous pouvez consulter les paiements,
          mais vous ne pouvez pas les modifier ni les supprimer.
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
                          factureSelectionnee.clientId
                        )}`
                      : "Facture introuvable"}
                  </p>
                </div>
              ) : (
                <select
                  value={factureId}
                  onChange={(e) => {
                    setFactureId(e.target.value);

                    const facture = factures.find(
                      (f) => f.id === Number(e.target.value)
                    );

                    setMontant(
                      facture ? String(montantRestant(facture)) : ""
                    );
                  }}
                  required
                >
                  <option value="">Choisir une facture</option>

                  {facturesEnAttente.map((facture) => (
                    <option key={facture.id} value={facture.id}>
                      {facture.numero} — {nomClient(facture.clientId)} —{" "}
                      Reste : {montantRestant(facture)} DH
                    </option>
                  ))}
                </select>
              )}

              {factureSelectionnee && (
                <p>
                  Montant restant à payer :{" "}
                  <strong>{montantMaximum} DH</strong>
                </p>
              )}

              <input
                type="number"
                min="0.01"
                max={montantMaximum}
                step="0.01"
                placeholder="Montant en DH"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                required
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <select
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
            type="text"
            placeholder="Rechercher par facture, client, date, mode ou montant..."
            value={recherche}
            onChange={changerRecherche}
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
            onChange={changerFiltre}
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
                  (f) => f.id === paiement.factureId
                );

                return (
                  <tr key={paiement.id}>
                    <td>{facture ? facture.numero : "Inconnue"}</td>

                    <td>
                      {facture
                        ? nomClient(facture.clientId)
                        : "Inconnu"}
                    </td>

                    <td>{paiement.montant} DH</td>
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
                              onClick={() => commencerModification(paiement)}
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
                              className="bouton petit bouton-danger"
                              onClick={() => gererSuppression(paiement)}
                            >
                              Supprimer
                            </button>
                          </>
                        )}

                        {lectureSeule && (
                          <span className="sous-titre">Consultation</span>
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
          <div
            className="pagination"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
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
