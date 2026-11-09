
import { useState } from "react";
import Menu from "./components/Menu";
import Accueil from "./pages/Accueil";
import Clients from "./pages/Clients";

import {
  clientsInitiaux,
  facturesInitiales,
  devisInitiaux,
} from "./data/data";

import "./App.css";

function App() {
  const [pageActive, setPageActive] = useState("Accueil");

  const [clients, setClients] = useState(clientsInitiaux);
  const [factures] = useState(facturesInitiales);
  const [devis] = useState(devisInitiaux);

  // Temporary user for testing the navigation menu
  const utilisateurDemo = {
    nom: "Utilisateur",
  };

  function deconnecter() {
    alert("Déconnexion");
  }

  function ajouterClient(client) {
    setClients((anciensClients) => [...anciensClients, client]);
  }

  function supprimerClient(id) {
    const clientUtilise = factures.some(
      (facture) => facture.clientId === id
    ) || devis.some(
      (item) => item.clientId === id
    );

    if (clientUtilise) {
      alert(
        "Impossible de supprimer ce client : il est associé à une facture ou à un devis."
      );
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce client ?"
    );

    if (!confirmation) {
      return;
    }

    setClients((anciensClients) =>
      anciensClients.filter((client) => client.id !== id)
    );
  }

  function afficherPage() {
    switch (pageActive) {
      case "Accueil":
        return (
          <Accueil
            clients={clients}
            factures={factures}
            devis={devis}
          />
        );

      case "Clients":
        return (
          <Clients
            clients={clients}
            ajouterClient={ajouterClient}
            supprimerClient={supprimerClient}
          />
        );

      default:
        return <h1>{pageActive}</h1>;
    }
  }

  return (
    <div className="application">
      <Menu
        pageActive={pageActive}
        changerPage={setPageActive}
        utilisateur={utilisateurDemo}
        deconnecter={deconnecter}
      />

      <main className="contenu">
        {afficherPage()}
      </main>

      <footer className="pied-page">
        GestionPro — Application de suivi des factures et des devis
      </footer>
    </div>
  );
}

export default App;
