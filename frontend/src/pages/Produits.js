import { useMemo, useState } from "react";

const marquesDisponibles = [
  "HP",
  "Dell",
  "Lenovo",
  "ASUS",
  "Acer",
  "MSI",
  "Apple",
  "Autre",
];

const formulaireInitial = {
  reference: "",
  nom: "",
  marque: "",
  processeur: "",
  ram: "",
  stockage: "",
  carteGraphique: "",
  tailleEcran: "",
  prixVente: "",
  description: "",
};

function Produits({
  produits,
  utilisateur,
  ajouterProduit,
  modifierProduit,
  supprimerProduit,
}) {
  const [formulaire, setFormulaire] = useState(formulaireInitial);
  const [produitEnCours, setProduitEnCours] = useState(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [marqueFiltre, setMarqueFiltre] = useState("toutes");

  const estSuperAdmin = utilisateur?.role === "super_admin";

  const marques = useMemo(
    () =>
      [...new Set(produits.map((produit) => produit.marque))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "fr")),
    [produits]
  );

  const produitsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return produits.filter((produit) => {
      const contenuRecherche = [
        produit.reference,
        produit.nom,
        produit.marque,
        produit.processeur,
        produit.ram,
        produit.stockage,
        produit.carteGraphique,
        produit.tailleEcran,
        produit.description,
      ]
        .join(" ")
        .toLowerCase();

      const correspondRecherche =
        !terme || contenuRecherche.includes(terme);

      const correspondMarque =
        marqueFiltre === "toutes" ||
        produit.marque === marqueFiltre;

      return correspondRecherche && correspondMarque;
    });
  }, [produits, recherche, marqueFiltre]);

  function reinitialiserFormulaire() {
    setFormulaire(formulaireInitial);
    setProduitEnCours(null);
    setFormulaireOuvert(false);
  }

  function changerChamp(e) {
    const { name, value } = e.target;

    setFormulaire((ancienFormulaire) => ({
      ...ancienFormulaire,
      [name]: value,
    }));
  }

  function ouvrirAjout() {
    setFormulaire(formulaireInitial);
    setProduitEnCours(null);
    setFormulaireOuvert(true);
  }

  function commencerModification(produit) {
    setProduitEnCours(produit);

    setFormulaire({
      reference: produit.reference || "",
      nom: produit.nom || "",
      marque: produit.marque || "",
      processeur: produit.processeur || "",
      ram: produit.ram || "",
      stockage: produit.stockage || "",
      carteGraphique: produit.carteGraphique || "",
      tailleEcran: produit.tailleEcran || "",
      prixVente: produit.prixVente ?? "",
      description: produit.description || "",
    });

    setFormulaireOuvert(true);
  }

  function gererSoumission(e) {
    e.preventDefault();

    const donnees = {
      reference: formulaire.reference.trim().toUpperCase(),
      nom: formulaire.nom.trim(),
      marque: formulaire.marque,
      processeur: formulaire.processeur.trim(),
      ram: formulaire.ram.trim(),
      stockage: formulaire.stockage.trim(),
      carteGraphique: formulaire.carteGraphique.trim(),
      tailleEcran: formulaire.tailleEcran.trim(),
      prixVente: Number(formulaire.prixVente),
      description: formulaire.description.trim(),
    };

    const champsRequis = [
      donnees.reference,
      donnees.nom,
      donnees.marque,
      donnees.processeur,
      donnees.ram,
      donnees.stockage,
      donnees.carteGraphique,
      donnees.tailleEcran,
    ];

    if (champsRequis.some((champ) => !champ)) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!Number.isFinite(donnees.prixVente) || donnees.prixVente <= 0) {
      alert("Le prix de vente doit être un montant positif.");
      return;
    }

    const referenceExiste = produits.some(
      (produit) =>
        produit.id !== produitEnCours?.id &&
        produit.reference.toLowerCase() ===
          donnees.reference.toLowerCase()
    );

    if (referenceExiste) {
      alert("Cette référence produit est déjà utilisée.");
      return;
    }

    if (produitEnCours) {
      modifierProduit(produitEnCours.id, donnees);
      alert("Produit modifié avec succès.");
    } else {
      ajouterProduit(donnees);
      alert("Produit ajouté avec succès.");
    }

    reinitialiserFormulaire();
  }

  function gererSuppression(produit) {
    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le produit « ${produit.nom} » ?`
    );

    if (confirmation) {
      supprimerProduit(produit.id);
    }
  }

  function formaterPrix(prix) {
    return `${Number(prix).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} MAD`;
  }

  return (
    <section>
      <h1>Catalogue des produits</h1>

      <p className="sous-titre">
        Consultez, recherchez et filtrez les ordinateurs portables proposés
        par votre entreprise.
      </p>

      {estSuperAdmin && (
        <div className="carte">
          {!formulaireOuvert ? (
            <>
              <h2>Gestion du catalogue</h2>
              <p className="sous-titre">
                Ajoutez un nouveau laptop ou modifiez un produit existant.
              </p>

              <button
                type="button"
                className="bouton"
                onClick={ouvrirAjout}
              >
                Ajouter un laptop
              </button>
            </>
          ) : (
            <>
              <h2>
                {produitEnCours
                  ? "Modifier un laptop"
                  : "Ajouter un laptop"}
              </h2>

              <form className="formulaire" onSubmit={gererSoumission}>
                <label htmlFor="produit-reference">
                  Référence produit
                </label>
                <input
                  id="produit-reference"
                  name="reference"
                  type="text"
                  value={formulaire.reference}
                  onChange={changerChamp}
                  placeholder="Ex. HP-PB-450G10-I5"
                  required
                />

                <label htmlFor="produit-nom">Nom du produit</label>
                <input
                  id="produit-nom"
                  name="nom"
                  type="text"
                  value={formulaire.nom}
                  onChange={changerChamp}
                  placeholder="Ex. HP ProBook 450 G10"
                  required
                />

                <label htmlFor="produit-marque">Marque</label>
                <select
                  id="produit-marque"
                  name="marque"
                  value={formulaire.marque}
                  onChange={changerChamp}
                  required
                >
                  <option value="">Choisir une marque</option>
                  {marquesDisponibles.map((marque) => (
                    <option key={marque} value={marque}>
                      {marque}
                    </option>
                  ))}
                </select>

                <label htmlFor="produit-processeur">Processeur</label>
                <input
                  id="produit-processeur"
                  name="processeur"
                  type="text"
                  value={formulaire.processeur}
                  onChange={changerChamp}
                  placeholder="Ex. Intel Core i5-1335U"
                  required
                />

                <label htmlFor="produit-ram">RAM</label>
                <input
                  id="produit-ram"
                  name="ram"
                  type="text"
                  value={formulaire.ram}
                  onChange={changerChamp}
                  placeholder="Ex. 16 Go"
                  required
                />

                <label htmlFor="produit-stockage">Stockage</label>
                <input
                  id="produit-stockage"
                  name="stockage"
                  type="text"
                  value={formulaire.stockage}
                  onChange={changerChamp}
                  placeholder="Ex. 512 Go SSD"
                  required
                />

                <label htmlFor="produit-carte-graphique">
                  Carte graphique
                </label>
                <input
                  id="produit-carte-graphique"
                  name="carteGraphique"
                  type="text"
                  value={formulaire.carteGraphique}
                  onChange={changerChamp}
                  placeholder="Ex. Intel Iris Xe"
                  required
                />

                <label htmlFor="produit-ecran">Taille de l’écran</label>
                <input
                  id="produit-ecran"
                  name="tailleEcran"
                  type="text"
                  value={formulaire.tailleEcran}
                  onChange={changerChamp}
                  placeholder={'Ex. 15,6"'}
                  required
                />

                <label htmlFor="produit-prix">Prix de vente (MAD)</label>
                <input
                  id="produit-prix"
                  name="prixVente"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formulaire.prixVente}
                  onChange={changerChamp}
                  placeholder="Ex. 8990"
                  required
                />

                <label htmlFor="produit-description">
                  Description (facultative)
                </label>
                <textarea
                  id="produit-description"
                  name="description"
                  value={formulaire.description}
                  onChange={changerChamp}
                  placeholder="Informations complémentaires sur le laptop"
                  rows="4"
                />

                <button type="submit" className="bouton">
                  {produitEnCours
                    ? "Enregistrer les modifications"
                    : "Ajouter le produit"}
                </button>

                <button
                  type="button"
                  className="bouton petit"
                  onClick={reinitialiserFormulaire}
                >
                  Annuler
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <div className="carte">
        <h2>Liste des laptops ({produitsFiltres.length})</h2>

        <div className="recherche-container">
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par nom, référence, marque ou spécifications..."
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

        <div className="formulaire">
          <label htmlFor="filtre-marque">Filtrer par marque</label>
          <select
            id="filtre-marque"
            value={marqueFiltre}
            onChange={(e) => setMarqueFiltre(e.target.value)}
          >
            <option value="toutes">Toutes les marques</option>
            {marques.map((marque) => (
              <option key={marque} value={marque}>
                {marque}
              </option>
            ))}
          </select>
        </div>

        <p className="sous-titre">
          {produitsFiltres.length} produit(s) trouvé(s)
        </p>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Référence</th>
                <th>Produit</th>
                <th>Marque</th>
                <th>Spécifications</th>
                <th>Prix de vente</th>
                <th>Description</th>
                {estSuperAdmin && <th>Actions</th>}
              </tr>
            </thead>

            <tbody>
              {produitsFiltres.map((produit) => (
                <tr key={produit.id}>
                  <td>{produit.id}</td>
                  <td>
                    <strong>{produit.reference}</strong>
                  </td>
                  <td>{produit.nom}</td>
                  <td>{produit.marque}</td>
                  <td>
                    {produit.processeur}
                    <br />
                    {produit.ram} · {produit.stockage}
                    <br />
                    {produit.carteGraphique} · {produit.tailleEcran}
                  </td>
                  <td>
                    <strong>{formaterPrix(produit.prixVente)}</strong>
                  </td>
                  <td>{produit.description || "Non renseignée"}</td>

                  {estSuperAdmin && (
                    <td>
                      <div className="actions-facture">
                        <button
                          type="button"
                          className="bouton petit"
                          onClick={() => commencerModification(produit)}
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          className="bouton petit bouton-danger"
                          onClick={() => gererSuppression(produit)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {produitsFiltres.length === 0 && (
                <tr>
                  <td colSpan={estSuperAdmin ? 8 : 7}>
                    Aucun produit ne correspond à votre recherche.
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

export default Produits;