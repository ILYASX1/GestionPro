
import { useState } from "react";

function Factures({
  factures,
  clients,
  ajouterFacture,
  changerStatutFacture,
  modifierFacture,
  supprimerFacture,
}) {
  const [clientId, setClientId] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [factureEnCours, setFactureEnCours] = useState(null);

  function reinitialiserFormulaire() {
    setClientId("");
    setMontant("");
    setDate(new Date().toISOString().slice(0, 10));
    setFactureEnCours(null);
  }

  function gererAjout(e) {
    e.preventDefault();

    if (!clientId || Number(montant) <= 0 || !date) {
      alert("Veuillez choisir un client, un montant valide et une date.");
      return;
    }

    const donnees = {
      clientId: Number(clientId),
      montant: Number(montant),
      date,
    };

    if (factureEnCours) {
      modifierFacture(factureEnCours.id, donnees);
    } else {
      ajouterFacture({
        id: Date.now(),
        numero: `FAC-${Date.now().toString().slice(-6)}`,
        ...donnees,
        statut: "En attente",
      });
    }

    reinitialiserFormulaire();
  }

  function commencerModification(facture) {
    if (facture.statut === "Payée") {
      alert(
        "Pour protéger les données de paiement, seules les factures en attente peuvent être modifiées."
      );
      return;
    }

    setFactureEnCours(facture);
    setClientId(String(facture.clientId));
    setMontant(String(facture.montant));
    setDate(facture.date);
  }

  function nomClient(id) {
    const client = clients.find((c) => c.id === id);
    return client ? client.nom : "Client inconnu";
  }

  return (
    <section>
      <h1>Gestion des factures</h1>
      <p className="sous-titre">
        Créez, modifiez et suivez vos factures.
      </p>

      <div className="carte">
        <h2>
          {factureEnCours ? "Modifier une facture" : "Créer une facture"}
        </h2>

        {clients.length === 0 ? (
          <p>Ajoutez d'abord un client dans la page Clients.</p>
        ) : (
          <form onSubmit={gererAjout} className="formulaire">
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
            >
              <option value="">Choisir un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nom}
                </option>
              ))}
            </select>

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

            <button className="bouton" type="submit">
              {factureEnCours
                ? "Enregistrer les modifications"
                : "Créer la facture"}
            </button>

            {factureEnCours && (
              <button
                className="bouton petit"
                type="button"
                onClick={reinitialiserFormulaire}
              >
                Annuler
              </button>
            )}
          </form>
        )}
      </div>

      <div className="carte">
        <h2>Liste des factures</h2>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {factures.map((facture) => (
                <tr key={facture.id}>
                  <td>{facture.numero}</td>
                  <td>{nomClient(facture.clientId)}</td>
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

                  <td>
                    <div className="actions-facture">
                      <button
                        type="button"
                        className="bouton petit"
                        onClick={() => commencerModification(facture)}
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        className="bouton petit bouton-danger"
                        onClick={() => supprimerFacture(facture.id)}
                      >
                        Supprimer
                      </button>

                      <button
                        type="button"
                        className="bouton petit"
                        onClick={() =>
                          changerStatutFacture(
                            facture.id,
                            facture.statut === "Payée"
                              ? "En attente"
                              : "Payée"
                          )
                        }
                      >
                        {facture.statut === "Payée"
                          ? "Remettre en attente"
                          : "Marquer payée"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {factures.length === 0 && (
                <tr>
                  <td colSpan="6">Aucune facture disponible.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Factures;
