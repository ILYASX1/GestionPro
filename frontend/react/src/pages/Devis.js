import { useMemo, useState } from "react";
import { exporterDocumentPDF } from "../utils/exportPdf";

function Devis({
  devis,
  clients,
  produits,
  ajouterDevis,
  changerStatutDevis,
  modifierDevis,
  supprimerDevis,
  convertirDevisEnFacture,
  lectureSeule = false,
}) {
  const [clientId, setClientId] = useState("");
  const [lignes, setLignes] = useState([]);
  const [montantAncienDevis, setMontantAncienDevis] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [devisEnCours, setDevisEnCours] = useState(null);
  const [rechercheProduit, setRechercheProduit] = useState("");
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [pageActuelle, setPageActuelle] = useState(1);

  const devisParPage = 5;

  const totalLignes = lignes.reduce(
    (total, ligne) =>
      total + Number(ligne.quantite || 0) * Number(ligne.prixUnitaire || 0),
    0
  );

  const montantDevis = lignes.length > 0 ? totalLignes : montantAncienDevis;

  const produitsFiltres = useMemo(() => {
    const terme = rechercheProduit.trim().toLowerCase();

    if (!terme) return produits;

    return produits.filter((produit) =>
      [
        produit.nom,
        produit.reference,
        produit.marque,
      ]
        .join(" ")
        .toLowerCase()
        .includes(terme)
    );
  }, [produits, rechercheProduit]);

  function formaterMontant(montant) {
    return `${Number(montant || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} DH`;
  }

  function calculerTotalLigne(ligne) {
    return (
      Number(ligne.quantite || 0) * Number(ligne.prixUnitaire || 0)
    );
  }

  function reinitialiserFormulaire() {
    setClientId("");
    setLignes([]);
    setMontantAncienDevis(0);
    setDate(new Date().toISOString().slice(0, 10));
    setDevisEnCours(null);
    setRechercheProduit("");
  }

  function ajouterProduitAuDevis(produit) {
    if (lectureSeule) return;

    setLignes((anciennesLignes) => {
      const ligneExistante = anciennesLignes.find(
        (ligne) => ligne.produitId === produit.id
      );

      if (ligneExistante) {
        return anciennesLignes.map((ligne) =>
          ligne.produitId === produit.id
            ? {
                ...ligne,
                quantite: Number(ligne.quantite) + 1,
              }
            : ligne
        );
      }

      return [
        ...anciennesLignes,
        {
          id: `${produit.id}-${Date.now()}`,
          produitId: produit.id,
          nom: produit.nom,
          reference: produit.reference,
          marque: produit.marque,
          processeur: produit.processeur,
          ram: produit.ram,
          stockage: produit.stockage,
          carteGraphique: produit.carteGraphique,
          tailleEcran: produit.tailleEcran,
          prixCatalogue: Number(produit.prixVente),
          prixUnitaire: Number(produit.prixVente),
          quantite: 1,
        },
      ];
    });
  }

  function modifierLigne(id, champ, valeur) {
    setLignes((anciennesLignes) =>
      anciennesLignes.map((ligne) => {
        if (ligne.id !== id) return ligne;

        if (champ === "quantite") {
          return {
            ...ligne,
            quantite: valeur,
          };
        }

        return {
          ...ligne,
          prixUnitaire: valeur,
        };
      })
    );
  }

  function supprimerLigne(id) {
    setLignes((anciennesLignes) =>
      anciennesLignes.filter((ligne) => ligne.id !== id)
    );
  }

  function lignesSontValides() {
    return lignes.every(
      (ligne) =>
        Number.isInteger(Number(ligne.quantite)) &&
        Number(ligne.quantite) > 0 &&
        Number.isFinite(Number(ligne.prixUnitaire)) &&
        Number(ligne.prixUnitaire) > 0
    );
  }

  function gererAjout(e) {
    e.preventDefault();

    if (lectureSeule) return;

    if (!clientId || !date) {
      alert("Sélectionnez un client et une date.");
      return;
    }

    if (lignes.length === 0 && !devisEnCours) {
      alert("Ajoutez au moins un laptop au devis.");
      return;
    }

    if (lignes.length > 0 && !lignesSontValides()) {
      alert(
        "Chaque ligne doit contenir une quantité entière positive et un prix unitaire positif."
      );
      return;
    }

    const donnees = {
      clientId: Number(clientId),
      montant: Number(montantDevis),
      date,
      lignes: lignes.map((ligne) => ({
        ...ligne,
        quantite: Number(ligne.quantite),
        prixCatalogue: Number(ligne.prixCatalogue),
        prixUnitaire: Number(ligne.prixUnitaire),
      })),
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
    const client = clients.find((item) => item.id === id);
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
    setDate(item.date);
    setMontantAncienDevis(Number(item.montant || 0));

    setLignes(
      (item.lignes || []).map((ligne, index) => ({
        ...ligne,
        id:
          ligne.id ||
          `${ligne.produitId || "produit"}-${item.id}-${index}`,
        quantite: Number(ligne.quantite || 1),
        prixCatalogue: Number(
          ligne.prixCatalogue ?? ligne.prixUnitaire ?? 0
        ),
        prixUnitaire: Number(ligne.prixUnitaire || 0),
      }))
    );
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

    const correspondRecherche = [
      item.numero,
      nomClient(item.clientId),
      item.date,
    ]
      .join(" ")
      .toLowerCase()
      .includes(terme);

    const correspondStatut =
      filtreStatut === "tous" || item.statut === filtreStatut;

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

  function exporterDevisPDF(item) {
    const client = clients.find((c) => c.id === item.clientId);
    const lignesDevis = item.lignes || [];

    const sectionsProduits =
      lignesDevis.length > 0
        ? lignesDevis.map((ligne, index) => ({
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
              { label: "Prix catalogue", valeur: formaterMontant(ligne.prixCatalogue) },
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
                    "Ce devis historique ne contient pas de détail produit.",
                },
              ],
            },
          ];

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
              valeur: formaterMontant(item.montant),
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
        ...sectionsProduits,
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
              <label htmlFor="devis-client">Client</label>
              <select
                id="devis-client"
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

              <label htmlFor="devis-date">Date</label>
              <input
                id="devis-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />

              <h3>Ajouter un laptop au devis</h3>

              {produits.length === 0 ? (
                <p className="sous-titre">
                  Aucun laptop n'est disponible dans le catalogue.
                </p>
              ) : (
                <>
                  <div className="recherche-container">
                    <input
                      type="search"
                      value={rechercheProduit}
                      onChange={(e) =>
                        setRechercheProduit(e.target.value)
                      }
                      placeholder="Rechercher par nom, référence ou marque..."
                    />

                    {rechercheProduit && (
                      <button
                        type="button"
                        className="bouton petit"
                        onClick={() => setRechercheProduit("")}
                      >
                        Effacer
                      </button>
                    )}
                  </div>

                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Référence</th>
                          <th>Laptop</th>
                          <th>Marque</th>
                          <th>Prix catalogue</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {produitsFiltres.map((produit) => (
                          <tr key={produit.id}>
                            <td>{produit.reference}</td>
                            <td>{produit.nom}</td>
                            <td>{produit.marque}</td>
                            <td>{formaterMontant(produit.prixVente)}</td>
                            <td>
                              <button
                                type="button"
                                className="bouton petit"
                                onClick={() =>
                                  ajouterProduitAuDevis(produit)
                                }
                              >
                                Ajouter
                              </button>
                            </td>
                          </tr>
                        ))}

                        {produitsFiltres.length === 0 && (
                          <tr>
                            <td colSpan="5">
                              Aucun laptop ne correspond à la recherche.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <h3>Laptops sélectionnés</h3>

              {lignes.length === 0 ? (
                <p className="sous-titre">
                  Aucun laptop sélectionné.
                </p>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Laptop</th>
                        <th>Spécifications</th>
                        <th>Prix catalogue</th>
                        <th>Quantité</th>
                        <th>Prix négocié</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {lignes.map((ligne) => (
                        <tr key={ligne.id}>
                          <td>
                            <strong>{ligne.nom}</strong>
                            <br />
                            <small>{ligne.reference} · {ligne.marque}</small>
                          </td>
                          <td>
                            {ligne.processeur}
                            <br />
                            {ligne.ram} · {ligne.stockage}
                            <br />
                            {ligne.carteGraphique} · {ligne.tailleEcran}
                          </td>
                          <td>{formaterMontant(ligne.prixCatalogue)}</td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={ligne.quantite}
                              onChange={(e) =>
                                modifierLigne(
                                  ligne.id,
                                  "quantite",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={ligne.prixUnitaire}
                              onChange={(e) =>
                                modifierLigne(
                                  ligne.id,
                                  "prixUnitaire",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <strong>
                              {formaterMontant(calculerTotalLigne(ligne))}
                            </strong>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="bouton petit bouton-danger"
                              onClick={() => supprimerLigne(ligne.id)}
                            >
                              Retirer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {devisEnCours && lignes.length === 0 && (
                <p className="message-info">
                  Ce devis historique ne possède pas encore de lignes produit.
                  Son montant actuel est conservé tant qu'aucun laptop n'est ajouté.
                </p>
              )}

              <p>
                <strong>Sous-total : {formaterMontant(montantDevis)}</strong>
              </p>

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
          <label htmlFor="filtreStatutDevis">
            Filtrer par statut :
          </label>

          <select
            id="filtreStatutDevis"
            value={filtreStatut}
            onChange={(e) => {
              setFiltreStatut(e.target.value);
              setPageActuelle(1);
            }}
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
                <th>Produits</th>
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
                  <td>
                    {item.lignes?.length
                      ? `${item.lignes.length} modèle(s)`
                      : "Non détaillé"}
                  </td>
                  <td>{formaterMontant(item.montant)}</td>
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
                  <td colSpan="7">
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

export default Devis;