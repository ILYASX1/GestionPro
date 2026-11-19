
import { useState } from "react";

function Factures({
  factures,
  clients,
  ajouterFacture,
  modifierFacture,
  supprimerFacture,
  lectureSeule = false,
}) {
  const [clientId, setClientId] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [factureEnCours, setFactureEnCours] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");

  // Pagination
  const [pageActuelle, setPageActuelle] = useState(1);
  const facturesParPage = 5;

  function reinitialiserFormulaire() {
    setClientId("");
    setMontant("");
    setDate(new Date().toISOString().slice(0, 10));
    setFactureEnCours(null);
  }

  function gererAjout(e) {
    e.preventDefault();

    if (lectureSeule) return;

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

      setPageActuelle(1);
    }

    reinitialiserFormulaire();
  }

  function commencerModification(facture) {
    if (lectureSeule) return;

    if (facture.statut !== "En attente") {
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

  function gererSuppression(facture) {
    if (lectureSeule) return;

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer la facture ${facture.numero} ?`
    );

    if (!confirmation) return;

    supprimerFacture(facture.id);

    if (factureEnCours?.id === facture.id) {
      reinitialiserFormulaire();
    }
  }

  function nomClient(id) {
    const client = clients.find((c) => c.id === id);
    return client ? client.nom : "Client inconnu";
  }

  // Recherche et filtrage des factures
  const facturesFiltrees = factures.filter((facture) => {
    const terme = recherche.trim().toLowerCase();

    const numero = String(facture.numero || "").toLowerCase();
    const nom = nomClient(facture.clientId).toLowerCase();
    const dateFacture = String(facture.date || "").toLowerCase();

    const correspondRecherche =
      numero.includes(terme) ||
      nom.includes(terme) ||
      dateFacture.includes(terme);

    const correspondStatut =
      filtreStatut === "tous" ||
      facture.statut === filtreStatut;

    return correspondRecherche && correspondStatut;
  });

  // Calcul de la pagination
  const nombrePages = Math.ceil(
    facturesFiltrees.length / facturesParPage
  );

  const pageValide = Math.min(
    pageActuelle,
    Math.max(nombrePages, 1)
  );

  const indiceDebut = (pageValide - 1) * facturesParPage;
  const indiceFin = indiceDebut + facturesParPage;

  const facturesAffichees = facturesFiltrees.slice(
    indiceDebut,
    indiceFin
  );

  function changerRecherche(e) {
    setRecherche(e.target.value);
    setPageActuelle(1);
  }

  function changerFiltre(e) {
    setFiltreStatut(e.target.value);
    setPageActuelle(1);
  }

  return (
    <section>
      <h1>Gestion des factures</h1>

      <p className="sous-titre">
        {lectureSeule
          ? "Consultez toutes les factures de l'entreprise."
          : "Créez, modifiez et suivez vos factures."}
      </p>

      {lectureSeule && (
        <p className="message-info">
          Mode consultation : vous pouvez consulter les factures,
          mais vous ne pouvez pas les modifier ni les supprimer.
        </p>
      )}

      {!lectureSeule && (
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
      )}

      <div className="carte">
        <h2>Liste des factures ({facturesFiltrees.length})</h2>

        <div className="recherche-container">
          <input
            type="search"
            placeholder="Rechercher par numéro, client ou date..."
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
          <label htmlFor="filtreStatut">
            Filtrer par statut :
          </label>

          <select
            id="filtreStatut"
            value={filtreStatut}
            onChange={changerFiltre}
          >
            <option value="tous">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Partiellement payée">
              Partiellement payées
            </option>
            <option value="Payée">Payées</option>
          </select>
        </div>

        <p className="sous-titre">
          {facturesFiltrees.length} facture(s) trouvée(s)
        </p>

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
              {facturesAffichees.map((facture) => (
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
                    {lectureSeule ? (
                      <span className="sous-titre">
                        Consultation
                      </span>
                    ) : (
                      <div className="actions-facture">
                        <button
                          type="button"
                          className="bouton petit"
                          onClick={() => commencerModification(facture)}
                          disabled={facture.statut !== "En attente"}
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          className="bouton petit bouton-danger"
                          onClick={() => gererSuppression(facture)}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {facturesFiltrees.length === 0 && (
                <tr>
                  <td colSpan="6">
                    {factures.length === 0
                      ? "Aucune facture disponible."
                      : "Aucune facture ne correspond à votre recherche ou à votre filtre."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

export default Factures;
