
import { useState } from "react";

function Devis({
  devis,
  clients,
  ajouterDevis,
  changerStatutDevis,
  modifierDevis,
  supprimerDevis,
  convertirDevisEnFacture,
}) {
  const [clientId, setClientId] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [devisEnCours, setDevisEnCours] = useState(null);

  function reinitialiserFormulaire() {
    setClientId("");
    setMontant("");
    setDate(new Date().toISOString().slice(0, 10));
    setDevisEnCours(null);
  }

  function gererAjout(e) {
    e.preventDefault();

    if (!clientId || Number(montant) <= 0 || !date) {
      alert("Sélectionnez un client, un montant valide et une date.");
      return;
    }

    const donnees = {
      clientId: Number(clientId),
      montant: Number(montant),
      date,
    };

    if (devisEnCours) {
      if (typeof modifierDevis !== "function") {
        alert("La fonction de modification n'est pas encore configurée.");
        return;
      }

      modifierDevis(devisEnCours.id, donnees);
    } else {
      ajouterDevis({
        id: Date.now(),
        numero: `DEV-${Date.now().toString().slice(-6)}`,
        ...donnees,
        statut: "En attente",
      });
    }

    reinitialiserFormulaire();
  }

  function nomClient(id) {
    const client = clients.find((c) => c.id === id);
    return client ? client.nom : "Client inconnu";
  }

  function commencerModification(item) {
    if (item.statut !== "En attente") {
      alert(
        "Seuls les devis en attente peuvent être modifiés."
      );
      return;
    }

    setDevisEnCours(item);
    setClientId(String(item.clientId));
    setMontant(String(item.montant));
    setDate(item.date);
  }

  function gererSuppression(item) {
    if (item.factureId || item.statut === "Converti") {
      alert("Impossible de supprimer un devis déjà converti en facture.");
      return;
    }

    if (typeof supprimerDevis !== "function") {
      alert("La fonction de suppression n'est pas encore configurée.");
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le devis ${item.numero} ?`
    );

    if (!confirmation) {
      return;
    }

    supprimerDevis(item.id);

    if (devisEnCours?.id === item.id) {
      reinitialiserFormulaire();
    }
  }

  function simulerEnvoi(id) {
    changerStatutDevis(id, "Envoyé");
    alert("Le devis a été marqué comme envoyé (simulation).");
  }

  function accepterDevis(id) {
    changerStatutDevis(id, "Accepté");
    alert("Le devis a été accepté avec succès.");
  }

  function convertirDevis(id) {
    if (typeof convertirDevisEnFacture !== "function") {
      alert("La conversion en facture n'est pas configurée.");
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous convertir ce devis en facture ?"
    );

    if (confirmation) {
      convertirDevisEnFacture(id);
    }
  }

  function afficherStatut(item) {
    if (item.statut === "Converti") {
      return <span className="badge payee">Converti</span>;
    }

    if (item.statut === "Accepté") {
      return <span className="badge payee">Accepté</span>;
    }

    if (item.statut === "Envoyé") {
      return <span className="badge attente">Envoyé</span>;
    }

    return <span className="badge attente">En attente</span>;
  }

  return (
    <section>
      <h1>Gestion des devis</h1>

      <p className="sous-titre">
        Créez, modifiez et suivez vos devis.
      </p>

      <div className="carte">
        <h2>
          {devisEnCours ? "Modifier un devis" : "Créer un devis"}
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

            <button type="submit" className="bouton">
              {devisEnCours
                ? "Enregistrer les modifications"
                : "Créer le devis"}
            </button>

            {devisEnCours && (
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
        <h2>Liste des devis</h2>

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
              {devis.map((item) => (
                <tr key={item.id}>
                  <td>{item.numero}</td>
                  <td>{nomClient(item.clientId)}</td>
                  <td>{item.montant} DH</td>
                  <td>{item.date}</td>

                  <td>{afficherStatut(item)}</td>

                  <td>
                    <div className="actions-facture">
                      {item.statut === "En attente" && (
                        <>
                          <button
                            type="button"
                            className="bouton petit"
                            onClick={() => commencerModification(item)}
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="bouton petit bouton-danger"
                            onClick={() => gererSuppression(item)}
                          >
                            Supprimer
                          </button>

                          <button
                            type="button"
                            className="bouton petit"
                            onClick={() => simulerEnvoi(item.id)}
                          >
                            Simuler l'envoi
                          </button>
                        </>
                      )}

                      {item.statut === "Envoyé" && (
                        <>
                          <button
                            type="button"
                            className="bouton petit"
                            onClick={() => accepterDevis(item.id)}
                          >
                            Accepter
                          </button>

                          <button
                            type="button"
                            className="bouton petit bouton-danger"
                            onClick={() => gererSuppression(item)}
                          >
                            Supprimer
                          </button>
                        </>
                      )}

                      {item.statut === "Accepté" && !item.factureId && (
                        <button
                          type="button"
                          className="bouton petit"
                          onClick={() => convertirDevis(item.id)}
                        >
                          Convertir en facture
                        </button>
                      )}

                      {item.statut === "Converti" && (
                        <span className="badge payee">
                          Facture créée
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {devis.length === 0 && (
                <tr>
                  <td colSpan="6">Aucun devis disponible.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Devis;
