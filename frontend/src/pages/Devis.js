
import { useState } from "react";
import { exporterDocumentPDF } from "../utils/exportPdf";

function Devis({
  devis,
  clients,
  ajouterDevis,
  changerStatutDevis,
  modifierDevis,
  supprimerDevis,
  convertirDevisEnFacture,
  lectureSeule = false,
}) {
  const [clientId, setClientId] = useState("");
  const [montant, setMontant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [devisEnCours, setDevisEnCours] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");

  const [pageActuelle, setPageActuelle] = useState(1);
  const devisParPage = 5;

  function reinitialiserFormulaire() {
    setClientId("");
    setMontant("");
    setDate(new Date().toISOString().slice(0, 10));
    setDevisEnCours(null);
  }

  function gererAjout(e) {
    e.preventDefault();

    if (lectureSeule) return;

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
      modifierDevis(devisEnCours.id, donnees);
    } else {
      ajouterDevis({
        id: Date.now(),
        numero: `DEV-${Date.now().toString().slice(-6)}`,
        ...donnees,
        statut: "En attente",
      });

      setPageActuelle(1);
    }

    reinitialiserFormulaire();
  }

  function nomClient(id) {
    const client = clients.find((c) => c.id === id);
    return client ? client.nom : "Client inconnu";
  }

  function commencerModification(item) {
    if (lectureSeule) return;

    if (item.statut !== "En attente") {
      alert("Seuls les devis en attente peuvent être modifiés.");
      return;
    }

    setDevisEnCours(item);
    setClientId(String(item.clientId));
    setMontant(String(item.montant));
    setDate(item.date);
  }

  function gererSuppression(item) {
    if (lectureSeule) return;

    if (item.factureId || item.statut === "Converti") {
      alert("Impossible de supprimer un devis déjà converti en facture.");
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le devis ${item.numero} ?`
    );

    if (!confirmation) return;

    supprimerDevis(item.id);

    if (devisEnCours?.id === item.id) {
      reinitialiserFormulaire();
    }
  }

  function simulerEnvoi(id) {
    if (lectureSeule) return;

    changerStatutDevis(id, "Envoyé");
    alert("Le devis a été marqué comme envoyé (simulation).");
  }

  function accepterDevis(id) {
    if (lectureSeule) return;

    changerStatutDevis(id, "Accepté");
    alert("Le devis a été accepté avec succès.");
  }

  function convertirDevis(id) {
    if (lectureSeule) return;

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

  const devisFiltres = devis.filter((item) => {
    const terme = recherche.trim().toLowerCase();

    const numero = String(item.numero || "").toLowerCase();
    const nom = nomClient(item.clientId).toLowerCase();
    const dateDevis = String(item.date || "").toLowerCase();

    const correspondRecherche =
      numero.includes(terme) ||
      nom.includes(terme) ||
      dateDevis.includes(terme);

    const correspondStatut =
      filtreStatut === "tous" ||
      item.statut === filtreStatut;

    return correspondRecherche && correspondStatut;
  });

  const nombrePages = Math.ceil(devisFiltres.length / devisParPage);

  const pageValide = Math.min(
    pageActuelle,
    Math.max(nombrePages, 1)
  );

  const indiceDebut = (pageValide - 1) * devisParPage;

  const devisAffiches = devisFiltres.slice(
    indiceDebut,
    indiceDebut + devisParPage
  );

  function changerRecherche(e) {
    setRecherche(e.target.value);
    setPageActuelle(1);
  }

  function changerFiltre(e) {
    setFiltreStatut(e.target.value);
    setPageActuelle(1);
  }

  function exporterDevisPDF(item) {
    const client = clients.find((c) => c.id === item.clientId);

    exporterDocumentPDF({
      titre: "Devis",
      numero: item.numero,
      description: "Document récapitulatif de la proposition commerciale.",
      nomFichier: `devis-${item.numero || item.id}`,
      sections: [
        {
          titre: "Informations du devis",
          champs: [
            { label: "Numéro du devis", valeur: item.numero },
            { label: "Date", valeur: item.date },
            { label: "Statut", valeur: item.statut || "En attente" },
            {
              label: "Montant total",
              valeur: `${Number(item.montant || 0).toLocaleString("fr-FR")} DH`,
            },
          ],
        },
        {
          titre: "Informations du client",
          champs: [
            { label: "Nom", valeur: client?.nom || "Client inconnu" },
            { label: "Email", valeur: client?.email || "Non renseigné" },
            { label: "Téléphone", valeur: client?.telephone || "Non renseigné" },
          ],
        },
      ],
    });
  }

  return (
    <section>
      <h1>Gestion des devis</h1>

      <p className="sous-titre">
        {lectureSeule
          ? "Consultation de tous les devis de l'entreprise."
          : "Créez, modifiez et suivez vos devis."}
      </p>

      {lectureSeule && (
        <p className="message-info">
          Mode consultation : vous ne pouvez pas modifier les devis.
        </p>
      )}

      {!lectureSeule && (
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
      )}

      <div className="carte">
        <h2>Liste des devis ({devisFiltres.length})</h2>

        <div className="recherche-container">
          <input
            type="text"
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
          <label htmlFor="filtreStatutDevis">
            Filtrer par statut :
          </label>

          <select
            id="filtreStatutDevis"
            value={filtreStatut}
            onChange={changerFiltre}
          >
            <option value="tous">Tous les statuts</option>
            <option value="En attente">En attente</option>
            <option value="Envoyé">Envoyé</option>
            <option value="Accepté">Accepté</option>
            <option value="Converti">Converti</option>
          </select>
        </div>

        <p className="sous-titre">
          {devisFiltres.length} devis trouvé(s)
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
              {devisAffiches.map((item) => (
                <tr key={item.id}>
                  <td>{item.numero}</td>
                  <td>{nomClient(item.clientId)}</td>
                  <td>{item.montant} DH</td>
                  <td>{item.date}</td>
                  <td>{afficherStatut(item)}</td>


            <td>
              <div className="actions-facture">
                <button
                  type="button"
                  className="bouton petit bouton-pdf"
                  onClick={() => exporterDevisPDF(item)}
                >
                  PDF
                </button>

                {!lectureSeule && (
                  <>
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
                  </>
                )}
              </div>
            </td>

                </tr>
              ))}

              {devisFiltres.length === 0 && (
                <tr>
                  <td colSpan="6">
                    {devis.length === 0
                      ? "Aucun devis disponible."
                      : "Aucun devis ne correspond à votre recherche ou à votre filtre."}
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

export default Devis;
