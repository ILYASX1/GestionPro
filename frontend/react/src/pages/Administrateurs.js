
import { useState } from "react";

function Administrateurs({
  comptes,
  clients,
  ajouterAdministrateur,
  modifierAdministrateur,
  supprimerAdministrateur,
}) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [administrateurEnCours, setAdministrateurEnCours] =
    useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(null);
  const [destinationId, setDestinationId] = useState("");

  const administrateurs = comptes.filter(
    (compte) => compte.role === "gestionnaire"
  );

  function reinitialiserFormulaire() {
    setNom("");
    setEmail("");
    setMotDePasse("");
    setAdministrateurEnCours(null);
  }

  function gererSoumission(e) {
    e.preventDefault();

    const nomPropre = nom.trim();
    const emailPropre = email.trim().toLowerCase();

    if (!nomPropre || !emailPropre) {
      alert("Veuillez remplir le nom et l'adresse email.");
      return;
    }

    if (administrateurEnCours === null) {
      if (motDePasse.length < 6) {
        alert("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      ajouterAdministrateur({
        nom: nomPropre,
        email: emailPropre,
        motDePasse,
      });
    } else {
      const donnees = {
        nom: nomPropre,
        email: emailPropre,
      };

      if (motDePasse.trim() !== "") {
        if (motDePasse.length < 6) {
          alert("Le mot de passe doit contenir au moins 6 caractères.");
          return;
        }

        donnees.motDePasse = motDePasse;
      }

      modifierAdministrateur(administrateurEnCours.id, donnees);
    }

    reinitialiserFormulaire();
  }

  function commencerModification(administrateur) {
    setAdministrateurEnCours(administrateur);
    setNom(administrateur.nom);
    setEmail(administrateur.email);
    setMotDePasse("");
  }

  function compterClients(gestionnaire) {
    return clients.filter(
      (client) => client.gestionnaireId === gestionnaire.id
    ).length;
  }

  function gererSuppression(administrateur) {
    const nombreClients = compterClients(administrateur);

    if (nombreClients > 0) {
      const autresGestionnaires = administrateurs.filter(
        (item) => item.id !== administrateur.id
      );

      if (autresGestionnaires.length === 0) {
        alert(
          "Impossible de supprimer ce gestionnaire : des clients lui sont attribués et aucun autre gestionnaire n'existe. Créez d'abord un autre gestionnaire."
        );
        return;
      }

      // Les clients doivent d'abord être réattribués.
      setSuppressionEnCours(administrateur);
      setDestinationId("");
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le compte de ${administrateur.nom} ?`
    );

    if (confirmation) {
      supprimerAdministrateur(administrateur.id);
    }
  }

  function confirmerTransfertEtSuppression() {
    if (!suppressionEnCours) return;

    if (!destinationId) {
      alert("Veuillez choisir le gestionnaire qui reprendra les clients.");
      return;
    }

    const confirmation = window.confirm(
      `Transférer les clients de ${suppressionEnCours.nom} puis supprimer son compte ? L'historique des clients (devis, factures, paiements) sera conservé.`
    );

    if (!confirmation) return;

    const supprime = supprimerAdministrateur(
      suppressionEnCours.id,
      Number(destinationId)
    );

    if (supprime) {
      setSuppressionEnCours(null);
      setDestinationId("");
    }
  }

  return (
    <section>
      <h1>Gestion des gestionnaires</h1>

      <p className="sous-titre">
        Créez et gérez les comptes des gestionnaires de votre entreprise.
      </p>

      <div className="statistiques">
        <div className="carte-stat">
          <p>Gestionnaires enregistrés</p>
          <h2>{administrateurs.length}</h2>
        </div>
      </div>

      <div className="carte">
        <h2>
          {administrateurEnCours
            ? "Modifier un gestionnaire"
            : "Ajouter un gestionnaire"}
        </h2>

        <form className="formulaire" onSubmit={gererSoumission}>
          <label htmlFor="admin-nom">Nom complet</label>
          <input
            id="admin-nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom du gestionnaire"
            required
          />

          <label htmlFor="admin-email">Adresse email</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@entreprise.com"
            required
          />

          <label htmlFor="admin-password">
            {administrateurEnCours
              ? "Nouveau mot de passe (facultatif)"
              : "Mot de passe"}
          </label>

          <input
            id="admin-password"
            type="password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder={
              administrateurEnCours
                ? "Laisser vide pour conserver le mot de passe"
                : "6 caractères minimum"
            }
            minLength={6}
            required={!administrateurEnCours}
            autoComplete="new-password"
          />

          <button type="submit" className="bouton">
            {administrateurEnCours
              ? "Enregistrer les modifications"
              : "Créer le compte"}
          </button>

          {administrateurEnCours && (
            <button
              type="button"
              className="bouton petit"
              onClick={reinitialiserFormulaire}
            >
              Annuler
            </button>
          )}
        </form>
      </div>

      {suppressionEnCours && (
        <div className="carte">
          <h2>Supprimer le compte de {suppressionEnCours.nom}</h2>

          <p>
            {compterClients(suppressionEnCours)} client(s) sont attribués à
            ce gestionnaire. Réattribuez-les à un autre gestionnaire avant
            de supprimer le compte. Leur historique (devis, factures,
            paiements) est conservé.
          </p>

          <div className="formulaire">
            <label htmlFor="gestionnaire-destination">
              Gestionnaire qui reprend les clients
            </label>

            <select
              id="gestionnaire-destination"
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
            >
              <option value="">Choisir un gestionnaire</option>
              {administrateurs
                .filter((item) => item.id !== suppressionEnCours.id)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nom}
                  </option>
                ))}
            </select>

            <button
              type="button"
              className="bouton bouton-danger"
              onClick={confirmerTransfertEtSuppression}
              disabled={!destinationId}
            >
              Transférer les clients et supprimer le compte
            </button>

            <button
              type="button"
              className="bouton petit"
              onClick={() => {
                setSuppressionEnCours(null);
                setDestinationId("");
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="carte">
        <h2>Liste des gestionnaires</h2>

        {administrateurs.length === 0 ? (
          <p>Aucun gestionnaire n'a été créé.</p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Adresse email</th>
                  <th>Clients attribués</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {administrateurs.map((administrateur) => {
                  const nombreClients = clients.filter(
                    (client) =>
                      client.gestionnaireId === administrateur.id
                  ).length;

                  return (
                    <tr key={administrateur.id}>
                      <td>{administrateur.nom}</td>
                      <td>{administrateur.email}</td>
                      <td>{nombreClients}</td>

                      <td>
                        <div className="actions-facture">
                          <button
                            type="button"
                            className="bouton petit"
                            onClick={() =>
                              commencerModification(administrateur)
                            }
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="bouton petit bouton-danger"
                            onClick={() =>
                              gererSuppression(administrateur)
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Administrateurs;
