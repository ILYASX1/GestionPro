
import { useState } from "react";

function Clients({ clients, ajouterClient, supprimerClient }) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");

  function gererAjout(e) {
    e.preventDefault();

    if (!nom.trim() || !email.trim()) {
      alert("Veuillez remplir le nom et l'email.");
      return;
    }

    ajouterClient({
      id: Date.now(),
      nom: nom.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
    });

    setNom("");
    setEmail("");
    setTelephone("");
  }

  return (
    <section>
      <h1>Gestion des clients</h1>
      <p className="sous-titre">
        Consultez et ajoutez vos clients.
      </p>

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

          <button type="submit" className="bouton">
            Ajouter le client
          </button>
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
                    <button
                      type="button"
                      className="bouton petit"
                      onClick={() => supprimerClient(client.id)}
                    >
                      Supprimer
                    </button>
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
