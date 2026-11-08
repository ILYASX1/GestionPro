
import { useState } from "react";
import Menu from "./components/Menu";
import Accueil from "./pages/Accueil";

import {
  clientsInitiaux,
  facturesInitiales,
  devisInitiaux,
} from "./data/data";

import "./App.css";

function App() {
  const [pageActive, setPageActive] = useState("Accueil");

  const [clients] = useState(clientsInitiaux);
  const [factures] = useState(facturesInitiales);
  const [devis] = useState(devisInitiaux);

  // Temporary user for testing the navigation menu
  const utilisateurDemo = {
    nom: "Utilisateur",
  };

  function deconnecter() {
    alert("Déconnexion");
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
