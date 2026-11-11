
import { useState } from "react";
import Menu from "./components/Menu";
import Accueil from "./pages/Accueil";
import Clients from "./pages/Clients";
import Factures from "./pages/Factures";
import Devis from "./pages/Devis";

import {
  clientsInitiaux,
  facturesInitiales,
  devisInitiaux,
  paiementsInitiaux,
} from "./data/data";

import "./App.css";

function App() {
  const [pageActive, setPageActive] = useState("Accueil");

  const [clients, setClients] = useState(clientsInitiaux);
  const [factures, setFactures] = useState(facturesInitiales);
  const [devis, setDevis] = useState(devisInitiaux);
  const [paiements] = useState(paiementsInitiaux);

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
    const clientUtilise =
      factures.some((facture) => facture.clientId === id) ||
      devis.some((item) => item.clientId === id);

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

  function ajouterFacture(facture) {
    setFactures((anciennesFactures) => [...anciennesFactures, facture]);
  }

  function changerStatutFacture(id, nouveauStatut) {
    setFactures((anciennesFactures) =>
      anciennesFactures.map((facture) =>
        facture.id === id
          ? { ...facture, statut: nouveauStatut }
          : facture
      )
    );
  }

  function modifierFacture(id, donnees) {
    setFactures((anciennesFactures) =>
      anciennesFactures.map((facture) =>
        facture.id === id
          ? { ...facture, ...donnees }
          : facture
      )
    );
  }

  function supprimerFacture(id) {
    const facture = factures.find((f) => f.id === id);

    if (!facture) {
      return;
    }

    if (paiements.some((p) => p.factureId === id)) {
      alert(
        "Impossible de supprimer cette facture : elle possède un paiement associé."
      );
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer la facture ${facture.numero} ?`
    );

    if (!confirmation) {
      return;
    }

    setFactures((anciennesFactures) =>
      anciennesFactures.filter((f) => f.id !== id)
    );
  }

  // Gestion des devis

  function ajouterDevis(nouveauDevis) {
    setDevis((anciensDevis) => [...anciensDevis, nouveauDevis]);
  }

  function changerStatutDevis(id, nouveauStatut) {
    setDevis((anciensDevis) =>
      anciensDevis.map((item) =>
        item.id === id
          ? { ...item, statut: nouveauStatut }
          : item
      )
    );
  }

  function modifierDevis(id, donnees) {
    setDevis((anciensDevis) =>
      anciensDevis.map((item) =>
        item.id === id
          ? { ...item, ...donnees }
          : item
      )
    );
  }

  function supprimerDevis(id) {
    const item = devis.find((d) => d.id === id);

    if (!item) {
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le devis ${item.numero} ?`
    );

    if (!confirmation) {
      return;
    }

    setDevis((anciensDevis) =>
      anciensDevis.filter((d) => d.id !== id)
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

      case "Factures":
        return (
          <Factures
            factures={factures}
            clients={clients}
            ajouterFacture={ajouterFacture}
            changerStatutFacture={changerStatutFacture}
            modifierFacture={modifierFacture}
            supprimerFacture={supprimerFacture}
          />
        );

      case "Devis":
        return (
          <Devis
            devis={devis}
            clients={clients}
            ajouterDevis={ajouterDevis}
            changerStatutDevis={changerStatutDevis}
            modifierDevis={modifierDevis}
            supprimerDevis={supprimerDevis}
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
