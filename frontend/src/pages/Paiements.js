
import { useState } from "react";

function Paiements({
  paiements,
  factures,
  clients,
  ajouterPaiement,
  modifierPaiement,
  supprimerPaiement,
}) {
  const [factureId, setFactureId] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState("Espèces");
  const [paiementEnCours, setPaiementEnCours] = useState(null);
  const [recherche, setRecherche] = useState("");

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
  }

  function commencerModification(paiement) {
    setPaiementEnCours(paiement);
    setFactureId(String(paiement.factureId));
    setMontant(String(paiement.montant));
    setDate(paiement.date);
    setMode(paiement.mode);
  }

  function gererSuppression(paiement) {
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

  // Recherche par numéro de facture, client, date, mode ou montant
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

    return (
      numeroFacture.includes(terme) ||
      client.includes(terme) ||
      datePaiement.includes(terme) ||
      modePaiement.includes(terme) ||
      montantPaiement.includes(terme)
    );
  });

  return (
    <section>
      <h1>Gestion des paiements</h1>

      <p className="sous-titre">
        Enregistrez, modifiez et consultez les paiements de vos clients.
      </p>

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

      <div className="carte">
        <h2>Historique des paiements</h2>

        <div className="recherche-container">
          <input
            type="text"
            placeholder="Rechercher par facture, client, date, mode ou montant..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />

          {recherche && (
            <button
              type="button"
              className="bouton petit"
              onClick={() => setRecherche("")}
            >
              Effacer
            </button>
          )}
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
              {paiementsFiltres.map((paiement) => {
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
                      : "Aucun paiement ne correspond à votre recherche."}
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

export default Paiements;
