
import { useState } from "react";
import Menu from "./components/Menu";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription.js";

import {
  clientsInitiaux,
  facturesInitiales,
  devisInitiaux,
  paiementsInitiaux,
} from "./data/data";

import Accueil from "./pages/Accueil";
import Clients from "./pages/Clients";
import Factures from "./pages/Factures";
import Devis from "./pages/Devis";
import Paiements from "./pages/Paiements";
import Relances from "./pages/Relances";

import "./App.css";

function App() {
  const [pageActive, setPageActive] = useState("Accueil");

  const [clients, setClients] = useState(clientsInitiaux);
  const [factures, setFactures] = useState(facturesInitiales);
  const [devis, setDevis] = useState(devisInitiaux);
  const [paiements, setPaiements] = useState(paiementsInitiaux);

  const [pageAuth, setPageAuth] = useState("Connexion");
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(null);
  const [comptes, setComptes] = useState([]);

  // Gestion de l'authentification

  function inscrire(nouveauCompte) {
    const emailExiste = comptes.some(
      (compte) =>
        compte.email.toLowerCase() === nouveauCompte.email.toLowerCase()
    );

    if (emailExiste) {
      alert("Cette adresse email possède déjà un compte.");
      return;
    }

    setComptes((anciensComptes) => [...anciensComptes, nouveauCompte]);

    alert("Compte créé avec succès. Vous pouvez maintenant vous connecter.");

    setPageAuth("Connexion");
  }

  function connecter(informations) {
    const compte = comptes.find(
      (item) =>
        item.email.toLowerCase() === informations.email.trim().toLowerCase() &&
        item.motDePasse === informations.motDePasse
    );

    if (!compte) {
      alert("Email ou mot de passe incorrect.");
      return;
    }

    setUtilisateurConnecte({
      nom: compte.nom,
      email: compte.email,
    });

    setPageActive("Accueil");
  }

  function deconnecter() {
    setUtilisateurConnecte(null);
    setPageAuth("Connexion");
  }

  // Gestion des clients

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

  // Gestion des factures

  function ajouterFacture(facture) {
    setFactures((anciennesFactures) => [
      ...anciennesFactures,
      facture,
    ]);
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
    setDevis((anciensDevis) => [
      ...anciensDevis,
      nouveauDevis,
    ]);
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

  // Gestion des paiements

  function ajouterPaiement(paiement) {
    setPaiements((anciensPaiements) => [
      ...anciensPaiements,
      paiement,
    ]);
  }

  function modifierPaiement(id, donnees) {
    const paiement = paiements.find((p) => p.id === id);

    if (!paiement) {
      return;
    }

    const facture = factures.find(
      (f) => f.id === paiement.factureId
    );

    if (
      !facture ||
      Number(donnees.montant) !== Number(facture.montant)
    ) {
      alert("Le montant doit correspondre au total de la facture.");
      return;
    }

    setPaiements((anciensPaiements) =>
      anciensPaiements.map((p) =>
        p.id === id ? { ...p, ...donnees } : p
      )
    );
  }

  function supprimerPaiement(id) {
    const paiement = paiements.find((p) => p.id === id);

    if (!paiement) {
      return;
    }

    const autrePaiement = paiements.some(
      (p) =>
        p.id !== id && p.factureId === paiement.factureId
    );

    setPaiements((anciensPaiements) =>
      anciensPaiements.filter((p) => p.id !== id)
    );

    if (!autrePaiement) {
      setFactures((anciennesFactures) =>
        anciennesFactures.map((facture) =>
          facture.id === paiement.factureId
            ? { ...facture, statut: "En attente" }
            : facture
        )
      );
    }
  }

  // Affichage des pages

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

      case "Paiements":
        return (
          <Paiements
            paiements={paiements}
            factures={factures}
            clients={clients}
            ajouterPaiement={ajouterPaiement}
            changerStatutFacture={changerStatutFacture}
            modifierPaiement={modifierPaiement}
            supprimerPaiement={supprimerPaiement}
          />
        );

      case "Relances":
        return (
          <Relances
            factures={factures}
            clients={clients}
          />
        );

      default:
        return <h1>{pageActive}</h1>;
    }
  }

  // Affichage de la connexion ou de l'inscription

  if (!utilisateurConnecte) {
    return (
      <div className="application">
        <main className="contenu">
          {pageAuth === "Connexion" ? (
            <Connexion
              connecter={connecter}
              allerInscription={() => setPageAuth("Inscription")}
            />
          ) : (
            <Inscription
              inscrire={inscrire}
              allerConnexion={() => setPageAuth("Connexion")}
            />
          )}
        </main>

        <footer className="pied-page">
          GestionPro — Application de suivi des factures et des devis
        </footer>
      </div>
    );
  }

  // Application principale

  return (
    <div className="application">
      <Menu
        pageActive={pageActive}
        changerPage={setPageActive}
        utilisateur={utilisateurConnecte}
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
