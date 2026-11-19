
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
  const [adminId, setAdminId] = useState("");
  const [clientEnCours, setClientEnCours] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [filtreTelephone, setFiltreTelephone] = useState("tous");
  const [pageActuelle, setPageActuelle] = useState(1);

  const clientsParPage = 5;
  const estSuperAdmin = utilisateur?.role === "super_admin";

  const administrateurs = comptes.filter(
    (compte) => compte.role === "admin"
  );

  function reinitialiserFormulaire() {
    setNom("");
    setEmail("");
    setTelephone("");
    setAdminId("");
    setClientEnCours(null);
  }

  function gererAjout(e) {
    e.preventDefault();

    if (!nom.trim() || !email.trim()) {
      alert("Veuillez remplir le nom et l'email.");
      return;
    }

    if (estSuperAdmin && !adminId) {
      alert("Veuillez attribuer ce client à un administrateur.");
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
      adminId: Number(adminId),
    });

    reinitialiserFormulaire();
    setPageActuelle(1);
    alert("Client ajouté et attribué avec succès.");
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

  function gererAttribution(client, nouvelAdminId) {
    if (!nouvelAdminId) {
      alert("Veuillez sélectionner un administrateur.");
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous transférer ce client à cet administrateur ? Il récupérera tout son historique."
    );

    if (!confirmation) return;

    attribuerClient(client.id, Number(nouvelAdminId));
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
        {estSuperAdmin
          ? "Ajoutez les clients et attribuez-les aux administrateurs."
          : "Consultez et gérez les clients qui vous sont attribués."}
      </p>

      {estSuperAdmin && (
        <div className="carte">
          <h2>Ajouter un client</h2>

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

            <label htmlFor="admin-responsable">
              Administrateur responsable
            </label>

            <select
              id="admin-responsable"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
            >
              <option value="">Choisir un administrateur</option>
              {administrateurs.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.nom}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="bouton"
              disabled={administrateurs.length === 0}
            >
              Ajouter et attribuer le client
            </button>

            {administrateurs.length === 0 && (
              <p className="sous-titre">
                Créez d'abord un compte administrateur.
              </p>
            )}
          </form>
        </div>
      )}

      {!estSuperAdmin && (
        <div className="carte">
          <h2>
            {clientEnCours ? "Modifier un client" : "Informations du client"}
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
            <p className="sous-titre">
              Sélectionnez « Modifier » dans la liste des clients pour modifier leurs informations.
            </p>
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
                {estSuperAdmin && <th>Administrateur</th>}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {clientsAffiches.map((client) => {
                const responsable = administrateurs.find(
                  (admin) => admin.id === client.adminId
                );

                return (
                  <tr key={client.id}>
                    <td>{client.nom}</td>
                    <td>{client.email}</td>
                    <td>{client.telephone || "Non renseigné"}</td>

                    {estSuperAdmin && (
                      <td>
                        <select
                          value={client.adminId || ""}
                          onChange={(e) =>
                            gererAttribution(client, e.target.value)
                          }
                        >
                          <option value="">Non attribué</option>
                          {administrateurs.map((admin) => (
                            <option key={admin.id} value={admin.id}>
                              {admin.nom}
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
                        {!estSuperAdmin && (
                          <button
                            type="button"
                            className="bouton petit"
                            onClick={() => commencerModification(client)}
                          >
                            Modifier
                          </button>
                        )}

                        {estSuperAdmin && (
                          <button
                            type="button"
                            className="bouton petit bouton-danger"
                            onClick={() => supprimerClient(client.id)}
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {clientsFiltres.length === 0 && (
                <tr>
                  <td colSpan={estSuperAdmin ? 5 : 4}>
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
