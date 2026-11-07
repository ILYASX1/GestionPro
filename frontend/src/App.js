
import { useState } from "react";
import Menu from "./components/Menu";
import "./App.css";

function App() {
  const [pageActive, setPageActive] = useState("Accueil");

  // Temporary user for testing the navigation menu
  const utilisateurDemo = {
    nom: "Utilisateur",
  };

  function deconnecter() {
    alert("Déconnexion");
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
        <h1>{pageActive}</h1>
      </main>

      <footer className="pied-page">
        GestionPro — Application de suivi des factures et des devis
      </footer>
    </div>
  );
}

export default App;
