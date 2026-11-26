import { useEffect, useRef, useState } from "react";

import Menu from "./components/Menu";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import MonCompte from "./pages/MonCompte";

import {
  clientsInitiaux,
  facturesInitiales,
  devisInitiaux,
  paiementsInitiaux,
  produitsInitiaux,
} from "./data/data";

import Accueil from "./pages/Accueil";
import Clients from "./pages/Clients";
import Produits from "./pages/Produits";
import Factures from "./pages/Factures";
import Devis from "./pages/Devis";
import Paiements from "./pages/Paiements";
import Relances from "./pages/Relances";
import Administrateurs from "./pages/Administrateurs";

import "./App.css";

const CLE_COMPTES = "gestionpro_comptes";

// MIGRATION DES RÔLES (anciens rôles -> nouveaux rôles)
// super_admin -> administrateur
// admin       -> gestionnaire
// Les comptes ne sont ni supprimés ni dupliqués et toutes leurs
// autres propriétés (id, nom, email, mot de passe...) sont conservées.
function migrerComptes(comptesStockes) {
  if (!Array.isArray(comptesStockes)) {
    return [];
  }

  const comptesValides = comptesStockes.filter(
    (compte) => compte && typeof compte === "object"
  );

  const aDejaUnAdministrateur = comptesValides.some(
    (compte) =>
      compte.role === "super_admin" ||
      compte.role === "administrateur"
  );

  // Cas de sécurité : aucun compte de niveau supérieur n'existe
  // (ancien rôle "admin" attribué au tout premier compte).
  // Le premier compte "admin" devient alors l'administrateur,
  // afin que l'application ne se retrouve jamais sans administrateur.
  let indexPremierAdmin = -1;

  if (!aDejaUnAdministrateur) {
    indexPremierAdmin = comptesValides.findIndex(
      (compte) => compte.role === "admin"
    );
  }

  return comptesValides.map((compte, index) => {
    if (compte.role === "super_admin") {
      return { ...compte, role: "administrateur" };
    }

    if (compte.role === "admin") {
      return {
        ...compte,
        role:
          index === indexPremierAdmin
            ? "administrateur"
            : "gestionnaire",
      };
    }

    return compte;
  });
}

function App() {
  const [pageActive, setPageActive] = useState("Accueil");

  const [clients, setClients] = useState(clientsInitiaux);
  const [factures, setFactures] = useState(facturesInitiales);
  const [devis, setDevis] = useState(devisInitiaux);
  const [paiements, setPaiements] = useState(paiementsInitiaux);
  const [produits, setProduits] = useState(produitsInitiaux);

  const [pageAuth, setPageAuth] = useState("Connexion");
  const [utilisateurConnecte, setUtilisateurConnecte] = useState(null);

  const [comptes, setComptes] = useState(() => {
    try {
      const comptesStockes = JSON.parse(
        localStorage.getItem(CLE_COMPTES) || "[]"
      );

      // Les comptes migrés sont sauvegardés par l'effet ci-dessous.
      return migrerComptes(comptesStockes);
    } catch {
      return [];
    }
  });

  // NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Évite de générer plusieurs fois le même rappel automatique.
  const notificationsAutomatiquesRef = useRef(new Set());

  function afficherToast(message) {
    setToast({ id: Date.now(), message });
  }

  useEffect(() => {
    if (!toast) return;

    const minuteur = setTimeout(() => {
      setToast(null);
    }, 3500);

    return () => clearTimeout(minuteur);
  }, [toast]);

  function ajouterNotification(titre, message, clientId = null) {
    const nouvelleNotification = {
      id: Date.now() + Math.random(),
      titre,
      message,
      clientId,
      date: new Date().toLocaleString("fr-FR"),
      lue: false,
    };

    setNotifications((anciennes) => [
      nouvelleNotification,
      ...anciennes,
    ]);

    afficherToast(message);
  }

  // RAPPELS AUTOMATIQUES DES ÉCHÉANCES
  // Ces rappels apparaissent dans la cloche, sans afficher de toast.

  useEffect(() => {
    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    const nouveauxRappels = [];

    factures.forEach((facture) => {
      if (!facture.dateEcheance) return;

      const dateEcheance = new Date(
        `${facture.dateEcheance}T00:00:00`
      );

      if (Number.isNaN(dateEcheance.getTime())) return;

      const totalPaye = paiements
        .filter(
          (paiement) =>
            String(paiement.factureId) === String(facture.id)
        )
        .reduce(
          (total, paiement) => total + Number(paiement.montant || 0),
          0
        );

      const montantRestant =
        Number(facture.montant || 0) - totalPaye;

      if (montantRestant <= 0) return;

      const differenceJours = Math.round(
        (dateEcheance.getTime() - aujourdHui.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      let typeRappel = "";
      let titre = "";
      let message = "";

      if (differenceJours < 0) {
        typeRappel = "retard";
        titre = "Facture en retard";

        message = `La facture ${facture.numero || ""} est en retard. Reste à payer : ${montantRestant.toFixed(2)} DH.`;
      } else if (differenceJours <= 3) {
        typeRappel = "echeance-proche";
        titre = "Échéance proche";

        message =
          differenceJours === 0
            ? `La facture ${facture.numero || ""} arrive à échéance aujourd'hui. Reste à payer : ${montantRestant.toFixed(2)} DH.`
            : `La facture ${facture.numero || ""} arrive à échéance dans ${differenceJours} jour(s). Reste à payer : ${montantRestant.toFixed(2)} DH.`;
      }

      if (!typeRappel) return;

      const cleRappel = `${facture.id}-${typeRappel}-${facture.dateEcheance}`;

      if (notificationsAutomatiquesRef.current.has(cleRappel)) {
        return;
      }

      notificationsAutomatiquesRef.current.add(cleRappel);

      nouveauxRappels.push({
        id: Date.now() + Math.random(),
        titre,
        message,
        clientId: facture.clientId,
        date: new Date().toLocaleString("fr-FR"),
        lue: false,
      });
    });

    if (nouveauxRappels.length > 0) {
      setNotifications((anciennes) => [
        ...nouveauxRappels,
        ...anciennes,
      ]);
    }
  }, [factures, paiements]);

  function marquerCommeLue(id) {
    setNotifications((anciennes) =>
      anciennes.map((notification) =>
        notification.id === id
          ? { ...notification, lue: true }
          : notification
      )
    );
  }

  function marquerToutesCommeLues() {
    setNotifications((anciennes) =>
      anciennes.map((notification) => ({
        ...notification,
        lue: true,
      }))
    );
  }

  // SAUVEGARDE DES COMPTES

  useEffect(() => {
    localStorage.setItem(
      CLE_COMPTES,
      JSON.stringify(comptes)
    );
  }, [comptes]);

  const administrateurExiste = comptes.some(
    (compte) => compte.role === "administrateur"
  );

  const estAdministrateur =
    utilisateurConnecte?.role === "administrateur";

  const estGestionnaire =
    utilisateurConnecte?.role === "gestionnaire";

  // DONNÉES VISIBLES SELON LE RÔLE

  const clientsVisibles = estAdministrateur
    ? clients
    : clients.filter(
        (client) => client.gestionnaireId === utilisateurConnecte?.id
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
      (item) => String(item.id) === String(paiement.factureId)
    );

    return (
      facture &&
      idsClientsVisibles.includes(facture.clientId)
    );
  });

  const notificationsVisibles = notifications.filter(
    (notification) =>
      estAdministrateur ||
      idsClientsVisibles.includes(notification.clientId)
  );

  const nombreNotificationsNonLues = notificationsVisibles.filter(
    (notification) => !notification.lue
  ).length;

    // AUTHENTIFICATION

  function inscrire(nouveauCompte) {
    if (administrateurExiste) {
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
      role: "administrateur",
    };

    setComptes((anciensComptes) => [
      ...anciensComptes,
      compteInitial,
    ]);

    alert(
      "Compte Administrateur créé avec succès. Vous pouvez maintenant vous connecter."
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

  // GESTION DES GESTIONNAIRES

  function ajouterAdministrateur(nouveauCompte) {
    if (!estAdministrateur) {
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
      role: "gestionnaire",
    };

    setComptes((anciensComptes) => [
      ...anciensComptes,
      nouvelAdministrateur,
    ]);

    alert("Le compte gestionnaire a été créé avec succès.");
  }

  function modifierAdministrateur(id, donnees) {
    if (!estAdministrateur) {
      alert("Accès non autorisé.");
      return;
    }

    const administrateur = comptes.find(
      (compte) => compte.id === id && compte.role === "gestionnaire"
    );

    if (!administrateur) {
      alert("Gestionnaire introuvable.");
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
        compte.id === id && compte.role === "gestionnaire"
          ? {
              ...compte,
              ...donnees,
              email: emailNormalise,
            }
          : compte
      )
    );

    alert("Les informations du gestionnaire ont été modifiées.");
  }

  function supprimerAdministrateur(id) {
    if (!estAdministrateur) {
      alert("Accès non autorisé.");
      return;
    }

    const administrateur = comptes.find(
      (compte) => compte.id === id && compte.role === "gestionnaire"
    );

    if (!administrateur) {
      alert("Gestionnaire introuvable.");
      return;
    }

    const nombreClients = clients.filter(
      (client) => client.gestionnaireId === id
    ).length;

    if (nombreClients > 0) {
      alert(
        "Impossible de supprimer ce gestionnaire : des clients lui sont attribués. Réattribuez d'abord ses clients."
      );
      return;
    }

    setComptes((anciensComptes) =>
      anciensComptes.filter((compte) => compte.id !== id)
    );

    alert("Le compte gestionnaire a été supprimé.");
  }

  // MODIFICATION DU COMPTE PERSONNEL

  function modifierMonCompte(donnees) {
    if (!utilisateurConnecte) {
      alert("Vous devez être connecté pour modifier votre compte.");
      return false;
    }

    const compteActuel = comptes.find(
      (compte) => compte.id === utilisateurConnecte.id
    );

    if (!compteActuel) {
      alert("Votre compte est introuvable.");
      return false;
    }

    const emailNormalise = donnees.email.trim().toLowerCase();

    const emailExiste = comptes.some(
      (compte) =>
        compte.id !== utilisateurConnecte.id &&
        compte.email.toLowerCase() === emailNormalise
    );

    if (emailExiste) {
      alert("Cette adresse email est déjà utilisée par un autre compte.");
      return false;
    }

    const changementMotDePasse = Boolean(
      donnees.motDePasseActuel || donnees.nouveauMotDePasse
    );

    if (changementMotDePasse) {
      if (compteActuel.motDePasse !== donnees.motDePasseActuel) {
        alert("Votre mot de passe actuel est incorrect.");
        return false;
      }

      if (
        !donnees.nouveauMotDePasse ||
        donnees.nouveauMotDePasse.length < 6
      ) {
        alert("Le nouveau mot de passe doit contenir au moins 6 caractères.");
        return false;
      }
    }

    const compteMisAJour = {
      ...compteActuel,
      nom: donnees.nom.trim(),
      email: emailNormalise,
      ...(changementMotDePasse
        ? { motDePasse: donnees.nouveauMotDePasse }
        : {}),
    };

    setComptes((anciensComptes) =>
      anciensComptes.map((compte) =>
        compte.id === utilisateurConnecte.id
          ? compteMisAJour
          : compte
      )
    );

    setUtilisateurConnecte({
      id: compteMisAJour.id,
      nom: compteMisAJour.nom,
      email: compteMisAJour.email,
      role: compteMisAJour.role,
    });

    alert("Votre compte a été mis à jour avec succès.");
    return true;
  }

    // GESTION DES CLIENTS

  function ajouterClient(client) {
    if (estAdministrateur) {
      // L'Administrateur assigne le client à un Gestionnaire
      const gestionnaire = comptes.find(
        (compte) =>
          compte.id === Number(client.gestionnaireId) &&
          compte.role === "gestionnaire"
      );

      if (!gestionnaire) {
        alert("Veuillez choisir un gestionnaire valide.");
        return;
      }

      setClients((anciensClients) => [
        ...anciensClients,
        {
          ...client,
          gestionnaireId: gestionnaire.id,
        },
      ]);
      return;
    }

    if (estGestionnaire) {
      // Le Gestionnaire s'assigne automatiquement le nouveau client
      setClients((anciensClients) => [
        ...anciensClients,
        {
          ...client,
          gestionnaireId: utilisateurConnecte.id,
        },
      ]);
      return;
    }

    alert("Accès non autorisé.");
  }

  function attribuerClient(clientId, nouvelGestionnaireId) {
    if (!estAdministrateur) {
      alert("Accès non autorisé.");
      return;
    }

    const gestionnaireExiste = comptes.some(
      (compte) =>
        compte.id === Number(nouvelGestionnaireId) &&
        compte.role === "gestionnaire"
    );

    if (!gestionnaireExiste) {
      alert("Gestionnaire introuvable.");
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
          ? { ...client, gestionnaireId: Number(nouvelGestionnaireId) }
          : client
      )
    );

    alert(
      "Le client a été transféré avec succès. Son historique reste associé à son dossier."
    );
  }

  function modifierClient(id, donnees) {
    if (!estGestionnaire) {
      alert(
        "Seul un gestionnaire peut modifier les informations d'un client."
      );
      return;
    }

    const clientExiste = clients.some(
      (client) =>
        client.id === id &&
        client.gestionnaireId === utilisateurConnecte.id
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
              gestionnaireId: client.gestionnaireId,
            }
          : client
      )
    );
  }

  function supprimerClient(id) {
    if (!estAdministrateur) {
      alert("Seul l'Administrateur peut supprimer un client.");
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

  // GESTION DES PRODUITS

  function ajouterProduit(produit) {
    if (!estAdministrateur) {
      alert("Seul l'Administrateur peut ajouter des produits.");
      return;
    }

    setProduits((anciensProduits) => [
      ...anciensProduits,
      {
        id: Date.now(),
        ...produit,
      },
    ]);
  }

  function modifierProduit(id, donnees) {
    if (!estAdministrateur) {
      alert("Seul l'Administrateur peut modifier les produits.");
      return;
    }

    const produitExiste = produits.some((produit) => produit.id === id);

    if (!produitExiste) {
      alert("Produit introuvable.");
      return;
    }

    setProduits((anciensProduits) =>
      anciensProduits.map((produit) =>
        produit.id === id
          ? {
              ...produit,
              ...donnees,
            }
          : produit
      )
    );
  }

  function supprimerProduit(id) {
    if (!estAdministrateur) {
      alert("Seul l'Administrateur peut supprimer les produits.");
      return;
    }

    const produitExiste = produits.some((produit) => produit.id === id);

    if (!produitExiste) {
      alert("Produit introuvable.");
      return;
    }

    setProduits((anciensProduits) =>
      anciensProduits.filter((produit) => produit.id !== id)
    );

    alert("Produit supprimé avec succès.");
  }

  // VÉRIFICATION DES DROITS COMMERCIAUX

  function autoriserModificationClient(clientId) {
    if (estAdministrateur) {
      alert(
        "L'Administrateur peut consulter les dossiers, mais ne peut pas modifier les opérations commerciales."
      );
      return false;
    }

    const clientAutorise = clients.some(
      (client) =>
        client.id === clientId &&
        client.gestionnaireId === utilisateurConnecte?.id
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

    ajouterNotification(
      "Nouvelle facture",
      `La facture ${facture.numero || ""} a été créée.`,
      facture.clientId
    );
  }

    // CONVERSION D'UN DEVIS EN FACTURE
  // Échéance automatique fixée à 30 jours.

  function convertirDevisEnFacture(id) {
    const devisSelectionne = devis.find(
      (item) => String(item.id) === String(id)
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

    const client = clients.find(
      (item) => item.id === devisSelectionne.clientId
    );

    if (!client) {
      alert("Le client associé à ce devis est introuvable.");
      return;
    }

    const aujourdHui = new Date();

    const formaterDate = (date) =>
      [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

    const dateActuelle = formaterDate(aujourdHui);

    const dateEcheance = new Date(aujourdHui);
    dateEcheance.setDate(dateEcheance.getDate() + 30);

    const nouvelId = Date.now();

    const lignesFacture = (devisSelectionne.lignes || []).map(
      (ligne, index) => ({
        id:
          ligne.id ||
          `${ligne.produitId || "produit"}-${nouvelId}-${index}`,
        produitId: ligne.produitId ?? null,
        nom: ligne.nom || "",
        reference: ligne.reference || "",
        marque: ligne.marque || "",
        processeur: ligne.processeur || "",
        ram: ligne.ram || "",
        stockage: ligne.stockage || "",
        carteGraphique: ligne.carteGraphique || "",
        tailleEcran: ligne.tailleEcran || "",
        prixCatalogue: Number(ligne.prixCatalogue || 0),
        prixUnitaire: Number(ligne.prixUnitaire || 0),
        quantite: Number(ligne.quantite || 0),
      })
    );

    const nouvelleFacture = {
      id: nouvelId,
      numero: `FAC-${nouvelId.toString().slice(-6)}`,
      clientId: devisSelectionne.clientId,
      clientSnapshot: {
        nom: client.nom || "",
        email: client.email || "",
        telephone: client.telephone || "",
      },
      devisId: devisSelectionne.id,
      devisNumero: devisSelectionne.numero || "",
      lignes: lignesFacture,
      montant: Number(devisSelectionne.montant || 0),
      date: dateActuelle,
      dateEcheance: formaterDate(dateEcheance),
      statut: "En attente",
    };

    setFactures((anciennesFactures) => [
      ...anciennesFactures,
      nouvelleFacture,
    ]);

    setDevis((anciensDevis) =>
      anciensDevis.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              statut: "Converti",
              factureId: nouvelleFacture.id,
            }
          : item
      )
    );

    ajouterNotification(
      "Facture créée",
      `Le devis ${devisSelectionne.numero || ""} a été converti en facture. Échéance : ${nouvelleFacture.dateEcheance}.`,
      devisSelectionne.clientId
    );
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

    ajouterNotification(
      "Nouveau devis",
      `Le devis ${nouveauDevis.numero || ""} a été créé.`,
      nouveauDevis.clientId
    );
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

    ajouterNotification(
      "Paiement enregistré",
      `Un paiement de ${Number(paiement.montant).toFixed(2)} DH a été enregistré pour la facture ${facture.numero || ""}.`,
      facture.clientId
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
      case "Produits":
        return (
          <Produits
            produits={produits}
            utilisateur={utilisateurConnecte}
            ajouterProduit={ajouterProduit}
            modifierProduit={modifierProduit}
            supprimerProduit={supprimerProduit}
          />
        );

      case "Devis":
        return (
          <Devis
            devis={devisVisibles}
            clients={clientsVisibles}
            produits={produits}
            ajouterDevis={ajouterDevis}
            changerStatutDevis={changerStatutDevis}
            modifierDevis={modifierDevis}
            supprimerDevis={supprimerDevis}
            convertirDevisEnFacture={convertirDevisEnFacture}
            lectureSeule={estAdministrateur}
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
            lectureSeule={estAdministrateur}
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
            lectureSeule={estAdministrateur}
          />
        );

      case "Relances":
        return (
          <Relances
            factures={facturesVisibles}
            clients={clientsVisibles}
            paiements={paiementsVisibles}
            lectureSeule={estAdministrateur}
          />
        );

      case "Administrateurs":
        if (!estAdministrateur) {
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

      case "MonCompte":
        return (
          <MonCompte
            utilisateur={utilisateurConnecte}
            modifierCompte={modifierMonCompte}
            retour={() => setPageActive("Accueil")}
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
              inscriptionDisponible={!administrateurExiste}
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
      {toast && (
        <div className="notification-toast" role="status">
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
      )}

      <Menu
        pageActive={pageActive}
        changerPage={setPageActive}
        utilisateur={utilisateurConnecte}
        ouvrirMonCompte={() => setPageActive("MonCompte")}
        deconnecter={deconnecter}
        notifications={notificationsVisibles}
        nombreNotificationsNonLues={nombreNotificationsNonLues}
        marquerCommeLue={marquerCommeLue}
        marquerToutesCommeLues={marquerToutesCommeLues}
      />

      <main className="contenu">
        <div key={pageActive} className="page-transition">
          {afficherPage()}
        </div>
      </main>

      <footer className="pied-page">
        GestionPro — Application de suivi des factures et des devis
      </footer>
    </div>
  );
}

export default App;