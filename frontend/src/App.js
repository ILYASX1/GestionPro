
import { useEffect, useState } from "react";

import Menu from "./components/Menu";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";

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
import Administrateurs from "./pages/Administrateurs";

import "./App.css";

function App() {
  const [pageActive, setPageActive] = useState("Accueil");

  const [clients, setClients] = useState(clientsInitiaux);
  const [factures, setFactures] = useState(facturesInitiales);
  const [devis, setDevis] = useState(devisInitiaux);
  const [paiements, setPaiements] = useState(paiementsInitiaux);

  const [pageAuth, setPageAuth] = useState("Connexion");
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(null);

  const [comptes, setComptes] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("gestionpro_comptes") || "[]"
      );
    } catch {
      return [];
    }
  });

  // SAUVEGARDE DES COMPTES

  useEffect(() => {
    localStorage.setItem(
      "gestionpro_comptes",
      JSON.stringify(comptes)
    );
  }, [comptes]);

  const superAdministrateurExiste = comptes.some(
    (compte) => compte.role === "super_admin"
  );

  const estSuperAdministrateur =
    utilisateurConnecte?.role === "super_admin";

  const estAdministrateur =
    utilisateurConnecte?.role === "admin";

  // DONNÉES VISIBLES SELON LE RÔLE

  const clientsVisibles = estSuperAdministrateur
    ? clients
    : clients.filter(
        (client) => client.adminId === utilisateurConnecte?.id
      );

  const idsClientsVisibles = clientsVisibles.map(
    (client) => client.id
  );

  const devisVisibles = devis.filter(
    (item) => idsClientsVisibles.includes(item.clientId)
  );

  const facturesVisibles = factures.filter(
    (facture) => idsClientsVisibles.includes(facture.clientId)
  );

  const paiementsVisibles = paiements.filter((paiement) => {
    const facture = factures.find(
      (item) => item.id === paiement.factureId
    );

    return (
      facture &&
      idsClientsVisibles.includes(facture.clientId)
    );
  });

  // AUTHENTIFICATION

  function inscrire(nouveauCompte) {
    if (superAdministrateurExiste) {
      alert("La création du premier compte est déjà terminée.");
      setPageAuth("Connexion");
      return;
    }

    const emailNormalise = nouveauCompte.email
      .trim()
      .toLowerCase();

    const emailExiste = comptes.some(
      (compte) => compte.email.toLowerCase() === emailNormalise
    );

    if (emailExiste) {
      alert("Cette adresse email possède déjà un compte.");
      return;
    }

    const compteInitial = {
      id: Date.now(),
      ...nouveauCompte,
      email: emailNormalise,
      role: "super_admin",
    };

    setComptes((anciensComptes) => [
      ...anciensComptes,
      compteInitial,
    ]);

    alert(
      "Compte Super administrateur créé avec succès. Vous pouvez maintenant vous connecter."
    );

    setPageAuth("Connexion");
  }

  function connecter(informations) {
    const compte = comptes.find(
      (item) =>
        item.email.toLowerCase() ===
          informations.email.trim().toLowerCase() &&
        item.motDePasse === informations.motDePasse
    );

    if (!compte) {
      alert("Email ou mot de passe incorrect.");
      return;
    }

    setUtilisateurConnecte({
      id: compte.id,
      nom: compte.nom,
      email: compte.email,
      role: compte.role,
    });

    setPageActive("Accueil");
  }

  function deconnecter() {
    setUtilisateurConnecte(null);
    setPageAuth("Connexion");
    setPageActive("Accueil");
  }

  // GESTION DES ADMINISTRATEURS

  function ajouterAdministrateur(nouveauCompte) {
    if (!estSuperAdministrateur) {
      alert("Accès non autorisé.");
      return;
    }

    const emailNormalise = nouveauCompte.email
      .trim()
      .toLowerCase();

    const emailExiste = comptes.some(
      (compte) => compte.email.toLowerCase() === emailNormalise
    );

    if (emailExiste) {
      alert("Cette adresse email est déjà utilisée.");
      return;
    }

    if (nouveauCompte.motDePasse.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    const nouvelAdministrateur = {
      id: Date.now(),
      nom: nouveauCompte.nom.trim(),
      email: emailNormalise,
      motDePasse: nouveauCompte.motDePasse,
      role: "admin",
    };

    setComptes((anciensComptes) => [
      ...anciensComptes,
      nouvelAdministrateur,
    ]);

    alert("Le compte administrateur a été créé avec succès.");
  }

  function modifierAdministrateur(id, donnees) {
    if (!estSuperAdministrateur) {
      alert("Accès non autorisé.");
      return;
    }

    const administrateur = comptes.find(
      (compte) => compte.id === id && compte.role === "admin"
    );

    if (!administrateur) {
      alert("Administrateur introuvable.");
      return;
    }

    const emailNormalise = donnees.email
      .trim()
      .toLowerCase();

    const emailExiste = comptes.some(
      (compte) =>
        compte.id !== id &&
        compte.email.toLowerCase() === emailNormalise
    );

    if (emailExiste) {
      alert("Cette adresse email est déjà utilisée.");
      return;
    }

    setComptes((anciensComptes) =>
      anciensComptes.map((compte) =>
        compte.id === id && compte.role === "admin"
          ? {
              ...compte,
              ...donnees,
              email: emailNormalise,
            }
          : compte
      )
    );

    alert("Les informations de l'administrateur ont été modifiées.");
  }

  function supprimerAdministrateur(id) {
    if (!estSuperAdministrateur) {
      alert("Accès non autorisé.");
      return;
    }

    const administrateur = comptes.find(
      (compte) => compte.id === id && compte.role === "admin"
    );

    if (!administrateur) {
      alert("Administrateur introuvable.");
      return;
    }

    const nombreClients = clients.filter(
      (client) => client.adminId === id
    ).length;

    if (nombreClients > 0) {
      alert(
        "Impossible de supprimer cet administrateur : des clients lui sont attribués. Réattribuez d'abord ses clients."
      );
      return;
    }

    setComptes((anciensComptes) =>
      anciensComptes.filter(
        (compte) => compte.id !== id
      )
    );

    alert("Le compte administrateur a été supprimé.");
  }

  // GESTION DES CLIENTS

  function ajouterClient(client) {
    if (!estSuperAdministrateur) {
      alert("Seul le Super administrateur peut ajouter des clients.");
      return;
    }

    const nouvelAdministrateur = comptes.find(
      (compte) =>
        compte.id === Number(client.adminId) &&
        compte.role === "admin"
    );

    if (!nouvelAdministrateur) {
      alert("Veuillez choisir un administrateur valide.");
      return;
    }

    setClients((anciensClients) => [
      ...anciensClients,
      {
        ...client,
        adminId: nouvelAdministrateur.id,
      },
    ]);
  }

  function attribuerClient(clientId, nouvelAdminId) {
    if (!estSuperAdministrateur) {
      alert("Accès non autorisé.");
      return;
    }

    const adminExiste = comptes.some(
      (compte) =>
        compte.id === Number(nouvelAdminId) &&
        compte.role === "admin"
    );

    if (!adminExiste) {
      alert("Administrateur introuvable.");
      return;
    }

    const clientExiste = clients.some(
      (client) => client.id === clientId
    );

    if (!clientExiste) {
      alert("Client introuvable.");
      return;
    }

    setClients((anciensClients) =>
      anciensClients.map((client) =>
        client.id === clientId
          ? { ...client, adminId: Number(nouvelAdminId) }
          : client
      )
    );

    alert(
      "Le client a été transféré avec succès. Son historique reste associé à son dossier."
    );
  }

  function modifierClient(id, donnees) {
    if (!estAdministrateur) {
      alert(
        "Seul un administrateur peut modifier les informations d'un client."
      );
      return;
    }

    const clientExiste = clients.some(
      (client) =>
        client.id === id &&
        client.adminId === utilisateurConnecte.id
    );

    if (!clientExiste) {
      alert("Vous ne pouvez pas modifier ce client.");
      return;
    }

    setClients((anciensClients) =>
      anciensClients.map((client) =>
        client.id === id
          ? {
              ...client,
              ...donnees,
              adminId: client.adminId,
            }
          : client
      )
    );
  }

  function supprimerClient(id) {
    if (!estSuperAdministrateur) {
      alert("Seul le Super administrateur peut supprimer un client.");
      return;
    }

    const clientExiste = clients.some(
      (client) => client.id === id
    );

    if (!clientExiste) {
      alert("Client introuvable.");
      return;
    }

    const clientUtilise =
      devis.some((item) => item.clientId === id) ||
      factures.some((facture) => facture.clientId === id) ||
      paiements.some((paiement) => {
        const facture = factures.find(
          (item) => item.id === paiement.factureId
        );

        return facture?.clientId === id;
      });

    if (clientUtilise) {
      alert(
        "Impossible de supprimer ce client : il possède un devis, une facture ou un paiement associé."
      );
      return;
    }

    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce client ?"
    );

    if (!confirmation) return;

    setClients((anciensClients) =>
      anciensClients.filter((client) => client.id !== id)
    );
  }

  // VÉRIFICATION DES DROITS COMMERCIAUX

  function autoriserModificationClient(clientId) {
    if (estSuperAdministrateur) {
      alert(
        "Le Super administrateur peut consulter les dossiers, mais ne peut pas modifier les opérations commerciales."
      );
      return false;
    }

    const clientAutorise = clients.some(
      (client) =>
        client.id === clientId &&
        client.adminId === utilisateurConnecte?.id
    );

    if (!clientAutorise) {
      alert("Vous n'avez pas accès à ce client.");
      return false;
    }

    return true;
  }

  // GESTION DES FACTURES

  function ajouterFacture(facture) {
    if (!autoriserModificationClient(facture.clientId)) return;

    setFactures((anciennesFactures) => [
      ...anciennesFactures,
      facture,
    ]);
  }

  function convertirDevisEnFacture(id) {
    const devisSelectionne = devis.find(
      (item) => item.id === id
    );

    if (!devisSelectionne) return;

    if (!autoriserModificationClient(devisSelectionne.clientId)) {
      return;
    }

    if (devisSelectionne.statut !== "Accepté") {
      alert("Seuls les devis acceptés peuvent être convertis.");
      return;
    }

    if (devisSelectionne.factureId) {
      alert("Ce devis a déjà été converti en facture.");
      return;
    }

    const dateActuelle = new Date()
      .toISOString()
      .slice(0, 10);

    const nouvelId = Date.now();

    const nouvelleFacture = {
      id: nouvelId,
      numero: `FAC-${nouvelId.toString().slice(-6)}`,
      clientId: devisSelectionne.clientId,
      montant: devisSelectionne.montant,
      date: dateActuelle,
      statut: "En attente",
      devisId: devisSelectionne.id,
    };

    setFactures((anciennesFactures) => [
      ...anciennesFactures,
      nouvelleFacture,
    ]);

    setDevis((anciensDevis) =>
      anciensDevis.map((item) =>
        item.id === id
          ? {
              ...item,
              statut: "Converti",
              factureId: nouvelleFacture.id,
            }
          : item
      )
    );

    alert("Le devis a été converti en facture avec succès.");
  }

  function modifierFacture(id, donnees) {
    const facture = factures.find((item) => item.id === id);

    if (!facture) return;

    if (!autoriserModificationClient(facture.clientId)) return;

    setFactures((anciennesFactures) =>
      anciennesFactures.map((item) =>
        item.id === id
          ? { ...item, ...donnees }
          : item
      )
    );
  }

  function supprimerFacture(id) {
    const facture = factures.find((item) => item.id === id);

    if (!facture) return;

    if (!autoriserModificationClient(facture.clientId)) return;

    if (paiements.some((paiement) => paiement.factureId === id)) {
      alert(
        "Impossible de supprimer cette facture : elle possède un paiement associé."
      );
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer la facture ${facture.numero} ?`
    );

    if (!confirmation) return;

    setFactures((anciennesFactures) =>
      anciennesFactures.filter((item) => item.id !== id)
    );
  }

  // GESTION DES DEVIS

  function ajouterDevis(nouveauDevis) {
    if (!autoriserModificationClient(nouveauDevis.clientId)) return;

    setDevis((anciensDevis) => [
      ...anciensDevis,
      nouveauDevis,
    ]);
  }

  function changerStatutDevis(id, nouveauStatut) {
    const devisSelectionne = devis.find(
      (item) => item.id === id
    );

    if (!devisSelectionne) return;

    if (!autoriserModificationClient(devisSelectionne.clientId)) {
      return;
    }

    setDevis((anciensDevis) =>
      anciensDevis.map((item) =>
        item.id === id
          ? { ...item, statut: nouveauStatut }
          : item
      )
    );
  }

  function modifierDevis(id, donnees) {
    const devisSelectionne = devis.find(
      (item) => item.id === id
    );

    if (!devisSelectionne) return;

    if (!autoriserModificationClient(devisSelectionne.clientId)) {
      return;
    }

    setDevis((anciensDevis) =>
      anciensDevis.map((item) =>
        item.id === id
          ? { ...item, ...donnees }
          : item
      )
    );
  }

  function supprimerDevis(id) {
    const devisSelectionne = devis.find(
      (item) => item.id === id
    );

    if (!devisSelectionne) return;

    if (!autoriserModificationClient(devisSelectionne.clientId)) {
      return;
    }

    if (devisSelectionne.factureId) {
      alert(
        "Impossible de supprimer ce devis : il a déjà été converti en facture."
      );
      return;
    }

    const confirmation = window.confirm(
      `Voulez-vous vraiment supprimer le devis ${devisSelectionne.numero} ?`
    );

    if (!confirmation) return;

    setDevis((anciensDevis) =>
      anciensDevis.filter((item) => item.id !== id)
    );
  }

  // GESTION DES PAIEMENTS

  function actualiserStatutFacture(factureId, listePaiements) {
    const facture = factures.find(
      (item) => item.id === factureId
    );

    if (!facture) return;

    const totalPaye = listePaiements
      .filter((paiement) => paiement.factureId === factureId)
      .reduce(
        (total, paiement) => total + Number(paiement.montant),
        0
      );

    let nouveauStatut = "En attente";

    if (totalPaye >= Number(facture.montant)) {
      nouveauStatut = "Payée";
    } else if (totalPaye > 0) {
      nouveauStatut = "Partiellement payée";
    }

    setFactures((anciennesFactures) =>
      anciennesFactures.map((item) =>
        item.id === factureId
          ? { ...item, statut: nouveauStatut }
          : item
      )
    );
  }

  function ajouterPaiement(paiement) {
    const facture = factures.find(
      (item) => item.id === paiement.factureId
    );

    if (!facture) {
      alert("Facture introuvable.");
      return;
    }

    if (!autoriserModificationClient(facture.clientId)) return;

    const totalDejaPaye = paiements
      .filter((item) => item.factureId === paiement.factureId)
      .reduce(
        (total, item) => total + Number(item.montant),
        0
      );

    const montantRestant =
      Number(facture.montant) - totalDejaPaye;

    if (
      Number(paiement.montant) <= 0 ||
      Number(paiement.montant) > montantRestant
    ) {
      alert(
        `Le montant ne peut pas dépasser le reste à payer : ${montantRestant} DH.`
      );
      return;
    }

    const nouveauxPaiements = [
      ...paiements,
      paiement,
    ];

    setPaiements(nouveauxPaiements);

    actualiserStatutFacture(
      paiement.factureId,
      nouveauxPaiements
    );
  }

  function modifierPaiement(id, donnees) {
    const paiement = paiements.find((item) => item.id === id);

    if (!paiement) return;

    const facture = factures.find(
      (item) => item.id === paiement.factureId
    );

    if (!facture) {
      alert("La facture associée à ce paiement est introuvable.");
      return;
    }

    if (!autoriserModificationClient(facture.clientId)) return;

    const totalAutresPaiements = paiements
      .filter(
        (item) =>
          item.factureId === paiement.factureId &&
          item.id !== id
      )
      .reduce(
        (total, item) => total + Number(item.montant),
        0
      );

    const nouveauMontant = Number(donnees.montant);

    if (
      nouveauMontant <= 0 ||
      totalAutresPaiements + nouveauMontant >
        Number(facture.montant)
    ) {
      const montantMaximum =
        Number(facture.montant) - totalAutresPaiements;

      alert(
        `Le montant maximum autorisé pour ce paiement est de ${montantMaximum} DH.`
      );
      return;
    }

    const nouveauxPaiements = paiements.map((item) =>
      item.id === id
        ? { ...item, ...donnees, montant: nouveauMontant }
        : item
    );

    setPaiements(nouveauxPaiements);

    actualiserStatutFacture(
      paiement.factureId,
      nouveauxPaiements
    );
  }

  function supprimerPaiement(id) {
    const paiement = paiements.find((item) => item.id === id);

    if (!paiement) return;

    const facture = factures.find(
      (item) => item.id === paiement.factureId
    );

    if (!facture) return;

    if (!autoriserModificationClient(facture.clientId)) return;

    const nouveauxPaiements = paiements.filter(
      (item) => item.id !== id
    );

    setPaiements(nouveauxPaiements);

    actualiserStatutFacture(
      paiement.factureId,
      nouveauxPaiements
    );
  }

  // AFFICHAGE DES PAGES

  function afficherPage() {
    switch (pageActive) {
      case "Accueil":
        return (
          <Accueil
            clients={clientsVisibles}
            factures={facturesVisibles}
            devis={devisVisibles}
            paiements={paiementsVisibles}
          />
        );

      case "Clients":
        return (
          <Clients
            clients={clientsVisibles}
            ajouterClient={ajouterClient}
            modifierClient={modifierClient}
            supprimerClient={supprimerClient}
            comptes={comptes}
            utilisateur={utilisateurConnecte}
            attribuerClient={attribuerClient}
          />
        );

      case "Devis":
        return (
          <Devis
            devis={devisVisibles}
            clients={clientsVisibles}
            ajouterDevis={ajouterDevis}
            changerStatutDevis={changerStatutDevis}
            modifierDevis={modifierDevis}
            supprimerDevis={supprimerDevis}
            convertirDevisEnFacture={convertirDevisEnFacture}
            lectureSeule={estSuperAdministrateur}
          />
        );

      case "Factures":
        return (
          <Factures
            factures={facturesVisibles}
            clients={clientsVisibles}
            ajouterFacture={ajouterFacture}
            modifierFacture={modifierFacture}
            supprimerFacture={supprimerFacture}
            lectureSeule={estSuperAdministrateur}
          />
        );

      case "Paiements":
        return (
          <Paiements
            paiements={paiementsVisibles}
            factures={facturesVisibles}
            clients={clientsVisibles}
            ajouterPaiement={ajouterPaiement}
            modifierPaiement={modifierPaiement}
            supprimerPaiement={supprimerPaiement}
            lectureSeule={estSuperAdministrateur}
          />
        );

      case "Relances":
        return (
          <Relances
            factures={facturesVisibles}
            clients={clientsVisibles}
            paiements={paiementsVisibles}
            lectureSeule={estSuperAdministrateur}
          />
        );

      case "Administrateurs":
        if (!estSuperAdministrateur) {
          return <h1>Accès non autorisé</h1>;
        }

        return (
          <Administrateurs
            comptes={comptes}
            clients={clients}
            ajouterAdministrateur={ajouterAdministrateur}
            modifierAdministrateur={modifierAdministrateur}
            supprimerAdministrateur={supprimerAdministrateur}
          />
        );

      default:
        return <h1>{pageActive}</h1>;
    }
  }

  // CONNEXION ET INSCRIPTION

  if (!utilisateurConnecte) {
    return (
      <div className="application">
        <main className="contenu">
          {pageAuth === "Connexion" ? (
            <Connexion
              connecter={connecter}
              allerInscription={() =>
                setPageAuth("Inscription")
              }
              inscriptionDisponible={!superAdministrateurExiste}
            />
          ) : (
            <Inscription
              inscrire={inscrire}
              allerConnexion={() =>
                setPageAuth("Connexion")
              }
            />
          )}
        </main>

        <footer className="pied-page">
          GestionPro — Application de suivi des factures et des devis
        </footer>
      </div>
    );
  }

  // APPLICATION PRINCIPALE

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
