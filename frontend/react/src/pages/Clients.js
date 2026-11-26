
import { useState } from "react";

function Clients({
  clients,
  ajouterClient,
  modifierClient,
  supprimerClient,
  comptes,
  utilisateur,
  attribuerClient,
}) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [clientEnCours, setClientEnCours] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [filtreTelephone, setFiltreTelephone] = useState("tous");
  const [pageActuelle, setPageActuelle] = useState(1);

  const clientsParPage = 5;
  const estAdmin = utilisateur?.role === "administrateur";
  const estGestionnaire = utilisateur?.role === "gestionnaire";

  const gestionnaires = comptes.filter(
    (compte) => compte.role === "gestionnaire"
  );

  function reinitialiserFormulaire() {
    setNom("");
    setEmail("");
    setTelephone("");
    setClientEnCours(null);
  }

  function gererAjout(e) {
    e.preventDefault();

    if (!nom.trim() || !email.trim()) {
      alert("Veuillez remplir le nom et l'email.");
      return;
    }

    if (!estGestionnaire) {
      alert("Seul un gestionnaire peut ajouter un client.");
      return;
    }

    const emailExiste = clients.some(
      (client) =>
        client.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (emailExiste) {
      alert("Cette adresse email est déjà utilisée par un autre client.");
      return;
    }

    ajouterClient({
      id: Date.now(),
      nom: nom.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
    });

    reinitialiserFormulaire();
    setPageActuelle(1);
    alert("Client ajouté avec succès.");
  }

  function commencerModification(client) {
    setClientEnCours(client);
    setNom(client.nom);
    setEmail(client.email);
    setTelephone(client.telephone || "");
  }

  function gererModification(e) {
    e.preventDefault();

    if (!nom.trim() || !email.trim()) {
      alert("Veuillez remplir le nom et l'email.");
      return;
    }

    const emailExiste = clients.some(
      (client) =>
        client.id !== clientEnCours.id &&
        client.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (emailExiste) {
      alert("Cette adresse email est déjà utilisée par un autre client.");
      return;
    }

    modifierClient(clientEnCours.id, {
      nom: nom.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
    });

    reinitialiserFormulaire();
    alert("Client modifié avec succès.");
  }

  function gererAttribution(client, nouvelGestionnaireId) {
    if (!nouvelGestionnaireId) {
      alert("Veuillez sélectionner un gestionnaire.");
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous transférer ce client à ce gestionnaire ? Il récupérera tout son historique."
    );

    if (!confirmation) return;

    if (!estAdmin) {
      alert("Seul l'Administrateur peut réattribuer un client.");
      return;
    }

    attribuerClient(client.id, Number(nouvelGestionnaireId));
  }

  const clientsFiltres = clients.filter((client) => {
    const terme = recherche.trim().toLowerCase();

    const correspondRecherche =
      client.nom.toLowerCase().includes(terme) ||
      client.email.toLowerCase().includes(terme) ||
      (client.telephone || "").toLowerCase().includes(terme);

    const possedeTelephone = Boolean(client.telephone?.trim());

    const correspondFiltre =
      filtreTelephone === "tous" ||
      (filtreTelephone === "avec" && possedeTelephone) ||
      (filtreTelephone === "sans" && !possedeTelephone);

    return correspondRecherche && correspondFiltre;
  });

  const nombrePages = Math.ceil(
    clientsFiltres.length / clientsParPage
  );

  const pageValide = Math.min(
    pageActuelle,
    Math.max(nombrePages, 1)
  );

  const indiceDebut = (pageValide - 1) * clientsParPage;

  const clientsAffiches = clientsFiltres.slice(
    indiceDebut,
    indiceDebut + clientsParPage
  );

  function changerRecherche(e) {
    setRecherche(e.target.value);
    setPageActuelle(1);
  }

  function changerFiltre(e) {
    setFiltreTelephone(e.target.value);
    setPageActuelle(1);
  }

  return (
    <section>
      <h1>Gestion des clients</h1>

      <p className="sous-titre">
        {estAdmin
          ? "Consultez tous les clients de l'entreprise et réattribuez-les aux gestionnaires."
          : "Consultez et gérez les clients qui vous sont attribués."}
      </p>

      {/* Formulaire d'ajout pour le Gestionnaire */}
      {estGestionnaire && (
        <div className="carte">
          <h2>
            {clientEnCours ? "Modifier un client" : "Ajouter un client"}
          </h2>

          {clientEnCours ? (
            <form onSubmit={gererModification} className="formulaire">
              <input
                type="text"
                placeholder="Nom complet"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="tel"
                placeholder="Téléphone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />

              <button type="submit" className="bouton">
                Enregistrer les modifications
              </button>

              <button
                type="button"
                className="bouton petit"
                onClick={reinitialiserFormulaire}
              >
                Annuler
              </button>
            </form>
          ) : (
            <form onSubmit={gererAjout} className="formulaire">
              <input
                type="text"
                placeholder="Nom complet"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="tel"
                placeholder="Téléphone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />

              <button type="submit" className="bouton">
                Ajouter le client
              </button>
            </form>
          )}
        </div>
      )}

      <div className="carte">
        <h2>Liste des clients ({clientsFiltres.length})</h2>

        <div className="recherche-container">
          <input
            type="search"
            placeholder="Rechercher par nom, email ou téléphone..."
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
          <label htmlFor="filtreTelephone">
            Filtrer les clients :
          </label>

          <select
            id="filtreTelephone"
            value={filtreTelephone}
            onChange={changerFiltre}
          >
            <option value="tous">Tous les clients</option>
            <option value="avec">Avec téléphone</option>
            <option value="sans">Sans téléphone</option>
          </select>
        </div>

        <p className="sous-titre">
          {clientsFiltres.length} client(s) trouvé(s)
        </p>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                {estAdmin && <th>Gestionnaire</th>}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {clientsAffiches.map((client) => {
                const responsable = gestionnaires.find(
                  (g) => g.id === client.gestionnaireId
                );

                return (
                  <tr key={client.id}>
                    <td>{client.nom}</td>
                    <td>{client.email}</td>
                    <td>{client.telephone || "Non renseigné"}</td>

                    {estAdmin && (
                      <td>
                        <select
                          value={client.gestionnaireId || ""}
                          onChange={(e) =>
                            gererAttribution(client, e.target.value)
                          }
                        >
                          <option value="">Non attribué</option>
                          {gestionnaires.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.nom}
                            </option>
                          ))}
                        </select>
                        {!responsable && (
                          <small> Aucune attribution</small>
                        )}
                      </td>
                    )}

                    <td>
                      <div className="actions-facture">
                        {estGestionnaire && (
                          <button
                            type="button"
                            className="bouton petit"
                            onClick={() => commencerModification(client)}
                          >
                            Modifier
                          </button>
                        )}

                        {estGestionnaire && (
                          <button
                            type="button"
                            className="bouton petit bouton-danger"
                            onClick={() => supprimerClient(client.id)}
                          >
                            Supprimer
                          </button>
                        )}

                        {estAdmin && <span>Consultation</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {clientsFiltres.length === 0 && (
                <tr>
                  <td colSpan={estAdmin ? 5 : 4}>
                    Aucun client ne correspond à votre recherche.
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

export default Clients;
