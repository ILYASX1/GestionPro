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
  const [factureDetaillee, setFactureDetaillee] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [pageActuelle, setPageActuelle] = useState(1);

  const facturesParPage = 5;

  function formaterMontant(valeur) {
    return `${Number(valeur || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} DH`;
  }

  function calculerTotalLigne(ligne) {
    return Number(ligne.quantite || 0) * Number(ligne.prixUnitaire || 0);
  }

  function nomClient(facture) {
    if (facture.clientSnapshot?.nom) {
      return facture.clientSnapshot.nom;
    }

    const client = clients.find((item) => item.id === facture.clientId);
    return client ? client.nom : "Client inconnu";
  }

  function informationsClient(facture) {
    if (facture.clientSnapshot) {
      return facture.clientSnapshot;
    }

    const client = clients.find((item) => item.id === facture.clientId);

    return {
      nom: client?.nom || "Client inconnu",
      email: client?.email || "Non renseigné",
      telephone: client?.telephone || "Non renseigné",
    };
  }

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

    if (factureDetaillee?.id === facture.id) {
      setFactureDetaillee(null);
    }
  }

  const facturesFiltrees = factures.filter((facture) => {
    const terme = recherche.trim().toLowerCase();

    const correspondRecherche = [
      facture.numero,
      nomClient(facture),
      facture.date,
      facture.dateEcheance,
      facture.devisNumero,
    ]
      .join(" ")
      .toLowerCase()
      .includes(terme);

    const correspondStatut =
      filtreStatut === "tous" || facture.statut === filtreStatut;

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

  const facturesAffichees = facturesFiltrees.slice(
    indiceDebut,
    indiceDebut + facturesParPage
  );

  function exporterFacturePDF(facture) {
    const client = informationsClient(facture);
    const lignes = facture.lignes || [];

    const sectionsProduits =
      lignes.length > 0
        ? lignes.map((ligne, index) => ({
            titre: `Laptop ${index + 1} — ${ligne.nom}`,
            champs: [
              { label: "Référence", valeur: ligne.reference },
              { label: "Marque", valeur: ligne.marque },
              {
                label: "Spécifications",
                valeur: [
                  ligne.processeur,
                  ligne.ram,
                  ligne.stockage,
                  ligne.carteGraphique,
                  ligne.tailleEcran,
                ]
                  .filter(Boolean)
                  .join(" · "),
              },
              { label: "Quantité", valeur: ligne.quantite },
              {
                label: "Prix unitaire négocié",
                valeur: formaterMontant(ligne.prixUnitaire),
              },
              {
                label: "Total de la ligne",
                valeur: formaterMontant(calculerTotalLigne(ligne)),
              },
            ],
          }))
        : [
            {
              titre: "Produits",
              champs: [
                {
                  label: "Information",
                  valeur:
                    "Cette facture historique ne contient pas de détail produit.",
                },
              ],
            },
          ];

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
            {
              label: "Référence du devis",
              valeur: facture.devisNumero || "Aucune",
            },
            { label: "Date d'émission", valeur: facture.date },
            {
              label: "Date d'échéance",
              valeur: facture.dateEcheance || "Non définie",
            },
            { label: "Statut", valeur: facture.statut || "En attente" },
            {
              label: "Montant total",
              valeur: formaterMontant(facture.montant),
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
        ...sectionsProduits,
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
          Mode consultation : vous ne pouvez pas modifier les factures.
        </p>
      )}

      {!lectureSeule && (
        <div className="carte">
          <h2>
            {factureEnCours
              ? "Modifier une facture"
              : "Créer une facture"}
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
            placeholder="Rechercher par numéro, client, devis ou date..."
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
          <label htmlFor="filtreStatut">
            Filtrer par statut :
          </label>

          <select
            id="filtreStatut"
            value={filtreStatut}
            onChange={(e) => {
              setFiltreStatut(e.target.value);
              setPageActuelle(1);
            }}
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
                <th>Devis</th>
                <th>Produits</th>
                <th>Montant</th>
                <th>Date</th>
                <th>Échéance</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {facturesAffichees.map((facture) => (
                <>
                  <tr key={facture.id}>
                    <td>{facture.numero}</td>
                    <td>{nomClient(facture)}</td>
                    <td>{facture.devisNumero || "—"}</td>
                    <td>
                      {facture.lignes?.length
                        ? `${facture.lignes.length} modèle(s)`
                        : "Non détaillé"}
                    </td>
                    <td>{formaterMontant(facture.montant)}</td>
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
                          className="bouton petit"
                          onClick={() =>
                            setFactureDetaillee(
                              factureDetaillee?.id === facture.id
                                ? null
                                : facture
                            )
                          }
                        >
                          Détails
                        </button>

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
                              onClick={() =>
                                commencerModification(facture)
                              }
                              disabled={
                                facture.statut !== "En attente"
                              }
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
                      </div>
                    </td>
                  </tr>

                  {factureDetaillee?.id === facture.id && (
                    <tr key={`${facture.id}-details`}>
                      <td colSpan="9">
                        <strong>Détails de la facture</strong>

                        {facture.lignes?.length ? (
                          <div className="table-responsive">
                            <table>
                              <thead>
                                <tr>
                                  <th>Référence</th>
                                  <th>Laptop</th>
                                  <th>Spécifications</th>
                                  <th>Quantité</th>
                                  <th>Prix négocié</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {facture.lignes.map((ligne, index) => (
                                  <tr
                                    key={
                                      ligne.id ||
                                      `${facture.id}-${index}`
                                    }
                                  >
                                    <td>{ligne.reference}</td>
                                    <td>
                                      <strong>{ligne.nom}</strong>
                                      <br />
                                      <small>{ligne.marque}</small>
                                    </td>
                                    <td>
                                      {ligne.processeur}
                                      <br />
                                      {ligne.ram} · {ligne.stockage}
                                      <br />
                                      {ligne.carteGraphique} ·{" "}
                                      {ligne.tailleEcran}
                                    </td>
                                    <td>{ligne.quantite}</td>
                                    <td>
                                      {formaterMontant(
                                        ligne.prixUnitaire
                                      )}
                                    </td>
                                    <td>
                                      <strong>
                                        {formaterMontant(
                                          calculerTotalLigne(ligne)
                                        )}
                                      </strong>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="sous-titre">
                            Cette facture historique ne contient pas de
                            détail produit.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {facturesFiltrees.length === 0 && (
                <tr>
                  <td colSpan="9">
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

export default Factures;