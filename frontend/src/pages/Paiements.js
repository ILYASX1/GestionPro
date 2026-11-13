
import { useState } from "react";

function Paiements({
  paiements,
  factures,
  clients,
  ajouterPaiement,
  changerStatutFacture,
  modifierPaiement,
  supprimerPaiement,
}) {
  const [factureId, setFactureId] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [mode, setMode] = useState("Espèces");
  const [paiementEnCours, setPaiementEnCours] = useState(null);

  const facturesEnAttente = factures.filter(
    (facture) =>
      facture.statut !== "Payée" &&
      !paiements.some((p) => p.factureId === facture.id)
  );

  function reinitialiserFormulaire() {
    setFactureId("");
    setMontant("");
    setDate(new Date().toISOString().slice(0, 10));
    setMode("Espèces");
    setPaiementEnCours(null);
  }

  function gererPaiement(e) {
    e.preventDefault();

    if (!date || Number(montant) <= 0) {
      alert("Veuillez saisir un montant valide et une date.");
      return;
    }

    if (paiementEnCours) {
      const facture = factures.find(
        (f) => f.id === paiementEnCours.factureId
      );

      if (!facture) {
        alert("La facture associée à ce paiement est introuvable.");
        return;
      }

      if (Number(montant) !== Number(facture.montant)) {
        alert(
          "Pour ce projet, le montant du paiement doit être égal au montant total de la facture."
        );
        return;
      }

      modifierPaiement(paiementEnCours.id, {
        montant: Number(montant),
        date,
        mode,
      });

      reinitialiserFormulaire();
      alert("Paiement modifié avec succès.");
      return;
    }

    const facture = factures.find(
      (f) => f.id === Number(factureId)
    );

    if (!facture) {
      alert("Veuillez choisir une facture valide.");
      return;
    }

    if (
      paiements.some((p) => p.factureId === facture.id) ||
      facture.statut === "Payée"
    ) {
      alert("Cette facture possède déjà un paiement ou est déjà payée.");
      return;
    }

    if (Number(montant) !== Number(facture.montant)) {
      alert(
        "Pour simplifier ce projet, le paiement doit couvrir le montant total de la facture."
      );
      return;
    }

    ajouterPaiement({
      id: Date.now(),
      factureId: facture.id,
      montant: Number(montant),
      date,
      mode,
    });

    changerStatutFacture(facture.id, "Payée");
    reinitialiserFormulaire();
    alert("Paiement enregistré avec succès.");
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

    if (!confirmation) {
      return;
    }

    supprimerPaiement(paiement.id);

    if (paiementEnCours?.id === paiement.id) {
      reinitialiserFormulaire();
    }
  }

  function nomClient(id) {
    const client = clients.find((c) => c.id === id);
    return client ? client.nom : "Client inconnu";
  }

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
                  {(() => {
                    const facture = factures.find(
                      (f) => f.id === paiementEnCours.factureId
                    );

                    return facture
                      ? `${facture.numero} — ${nomClient(facture.clientId)}`
                      : "Facture introuvable";
                  })()}
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
                    facture ? String(facture.montant) : ""
                  );
                }}
                required
              >
                <option value="">Choisir une facture</option>

                {facturesEnAttente.map((facture) => (
                  <option key={facture.id} value={facture.id}>
                    {facture.numero} — {nomClient(facture.clientId)} —{" "}
                    {facture.montant} DH
                  </option>
                ))}
              </select>
            )}

            <input
              type="number"
              min="0.01"
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
              {paiements.map((paiement) => {
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

              {paiements.length === 0 && (
                <tr>
                  <td colSpan="6">Aucun paiement enregistré.</td>
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
