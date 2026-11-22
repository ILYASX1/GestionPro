
import { useState } from "react";
import { exporterDocumentPDF } from "../utils/exportPdf";

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
  const [dateEcheance, setDateEcheance] = useState("");
  const [factureEnCours, setFactureEnCours] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");

  const [pageActuelle, setPageActuelle] = useState(1);
  const facturesParPage = 5;

  function reinitialiserFormulaire() {
    setClientId("");
    setMontant("");
    setDate(new Date().toISOString().slice(0, 10));
    setDateEcheance("");
    setFactureEnCours(null);
  }

  function gererAjout(e) {
    e.preventDefault();

    if (lectureSeule) return;

    if (!clientId || Number(montant) <= 0 || !date || !dateEcheance) {
      alert("Veuillez remplir tous les champs avec des valeurs valides.");
      return;
    }

    if (dateEcheance < date) {
      alert(
        "La date d'échéance doit être égale ou postérieure à la date de facture."
      );
      return;
    }

    const donnees = {
      clientId: Number(clientId),
      montant: Number(montant),
      date,
      dateEcheance,
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
    setDateEcheance(facture.dateEcheance || "");
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

  const facturesFiltrees = factures.filter((facture) => {
    const terme = recherche.trim().toLowerCase();

    const numero = String(facture.numero || "").toLowerCase();
    const nom = nomClient(facture.clientId).toLowerCase();
    const dateFacture = String(facture.date || "").toLowerCase();
    const echeance = String(facture.dateEcheance || "").toLowerCase();

    const correspondRecherche =
      numero.includes(terme) ||
      nom.includes(terme) ||
      dateFacture.includes(terme) ||
      echeance.includes(terme);

    const correspondStatut =
      filtreStatut === "tous" ||
      facture.statut === filtreStatut;

    return correspondRecherche && correspondStatut;
  });

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

  function exporterFacturePDF(facture) {
    const client = clients.find((c) => c.id === facture.clientId);

    exporterDocumentPDF({
      titre: "Facture",
      numero: facture.numero,
      description: "Document récapitulatif de facturation.",
      nomFichier: `facture-${facture.numero || facture.id}`,
      sections: [
        {
          titre: "Informations de la facture",
          champs: [
            { label: "Numéro de facture", valeur: facture.numero },
            { label: "Date d'émission", valeur: facture.date },
            {
              label: "Date d'échéance",
              valeur: facture.dateEcheance || "Non définie",
            },
            { label: "Statut", valeur: facture.statut || "En attente" },
            {
              label: "Montant total",
              valeur: `${Number(facture.montant || 0).toLocaleString("fr-FR")} DH`,
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
              <label htmlFor="clientFacture">Client</label>

              <select
                id="clientFacture"
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

              <label htmlFor="montantFacture">Montant (DH)</label>

              <input
                id="montantFacture"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Montant en DH"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                required
              />

              <label htmlFor="dateFacture">Date de facture</label>

              <input
                id="dateFacture"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <label htmlFor="dateEcheance">
                Date d'échéance
              </label>

              <input
                id="dateEcheance"
                type="date"
                min={date}
                value={dateEcheance}
                onChange={(e) => setDateEcheance(e.target.value)}
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
                <th>Échéance</th>
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
                  <td>{facture.dateEcheance || "Non définie"}</td>

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
                        className="bouton petit bouton-pdf"
                        onClick={() => exporterFacturePDF(facture)}
                      >
                        PDF
                      </button>

                      {!lectureSeule && (
                        <>
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
                        </>
                      )}

                      {lectureSeule && (
                        <span className="sous-titre">Consultation</span>
                      )}
                    </div>
                  </td>

                </tr>
              ))}

              {facturesFiltrees.length === 0 && (
                <tr>
                  <td colSpan="7">
                    {factures.length === 0
                      ? "Aucune facture disponible."
                      : "Aucune facture ne correspond à votre recherche ou à votre filtre."}
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

export default Factures;
