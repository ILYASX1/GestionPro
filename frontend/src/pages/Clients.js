
import { useState } from "react";

function Clients({
  clients,
  ajouterClient,
  modifierClient,
  supprimerClient,
}) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [clientEnCours, setClientEnCours] = useState(null);

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

  return (
    <section>
      <h1>Gestion des clients</h1>

      <p className="sous-titre">
        Consultez, ajoutez et modifiez les informations de vos clients.
      </p>

      <div className="carte">
        <h2>
          {clientEnCours ? "Modifier un client" : "Ajouter un client"}
        </h2>

        <form
          onSubmit={clientEnCours ? gererModification : gererAjout}
          className="formulaire"
        >
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
            {clientEnCours
              ? "Enregistrer les modifications"
              : "Ajouter le client"}
          </button>

          {clientEnCours && (
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

      <div className="carte">
        <h2>Liste des clients ({clients.length})</h2>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.nom}</td>
                  <td>{client.email}</td>
                  <td>{client.telephone || "Non renseigné"}</td>

                  <td>
                    <div className="actions-facture">
                      <button
                        type="button"
                        className="bouton petit"
                        onClick={() => commencerModification(client)}
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        className="bouton petit bouton-danger"
                        onClick={() => supprimerClient(client.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {clients.length === 0 && (
                <tr>
                  <td colSpan="4">Aucun client enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Clients;
