import { exporterDocumentPDF } from "../utils/exportPdf";

function Relances({
  factures,
  clients,
  paiements,
  lectureSeule = false,
}) {
  function convertirEnNombre(valeur) {
    const nombre = Number(valeur);
    return Number.isFinite(nombre) ? nombre : 0;
  }

  function formaterMontant(montant) {
    return `${convertirEnNombre(montant).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} DH`;
  }

  function lireDate(date) {
    if (!date) return null;

    const resultat = new Date(`${date}T00:00:00`);

    return Number.isNaN(resultat.getTime()) ? null : resultat;
  }

  function factureAnnulee(facture) {
    return ["Annulée", "Annulee", "Cancelled", "Canceled"].includes(
      facture.statut
    );
  }

  function informationsClient(facture) {
    if (facture.clientSnapshot) {
      return {
        nom: facture.clientSnapshot.nom || "Client inconnu",
        email: facture.clientSnapshot.email || "Non renseigné",
        telephone:
          facture.clientSnapshot.telephone || "Non renseigné",
      };
    }

    const client = clients.find(
      (item) => item.id === facture.clientId
    );

    return {
      nom: client?.nom || "Client inconnu",
      email: client?.email || "Non renseigné",
      telephone: client?.telephone || "Non renseigné",
    };
  }

  function totalPaye(facture) {
    return paiements
      .filter(
        (paiement) =>
          String(paiement.factureId) === String(facture.id)
      )
      .reduce(
        (total, paiement) =>
          total + Math.max(0, convertirEnNombre(paiement.montant)),
        0
      );
  }

  function montantRestant(facture) {
    return Math.max(
      0,
      convertirEnNombre(facture.montant) - totalPaye(facture)
    );
  }

  function statutRelance(facture) {
    const echeance = lireDate(facture.dateEcheance);

    if (!echeance) {
      return "À relancer";
    }

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    return echeance < aujourdHui ? "En retard" : "À relancer";
  }

  function classeStatutRelance(facture) {
    return statutRelance(facture) === "En retard"
      ? "badge attente"
      : "badge";
  }

  const facturesARelancer = factures.filter(
    (facture) =>
      !factureAnnulee(facture) && montantRestant(facture) > 0
  );

  function preparerRelance(facture) {
    if (lectureSeule) return;

    const client = informationsClient(facture);
    const montantPaye = totalPaye(facture);
    const restant = montantRestant(facture);

    alert(
      `Relance préparée !\n\n` +
        `Référence : REL-${facture.numero || facture.id}\n` +
        `Facture : ${facture.numero}\n` +
        `Client : ${client.nom}\n` +
        `Email : ${client.email}\n` +
        `Montant facture : ${formaterMontant(facture.montant)}\n` +
        `Montant déjà payé : ${formaterMontant(montantPaye)}\n` +
        `Montant restant : ${formaterMontant(restant)}\n\n` +
        `Ceci est une simulation. Aucun email n'a été envoyé.`
    );
  }

  function exporterRelancePDF(facture) {
    const client = informationsClient(facture);
    const montantPaye = totalPaye(facture);
    const restant = montantRestant(facture);
    const dateRelance = new Date().toLocaleDateString("fr-FR");

    exporterDocumentPDF({
      titre: "Relance de paiement",
      numero: `REL-${facture.numero || facture.id}`,
      description:
        "Rappel concernant le règlement du solde restant de la facture ci-dessous.",
      nomFichier: `relance-${facture.numero || facture.id}`,
      sections: [
        {
          titre: "Destinataire",
          champs: [
            { label: "Client", valeur: client.nom },
            { label: "Email", valeur: client.email },
            { label: "Téléphone", valeur: client.telephone },
          ],
        },
        {
          titre: "Détails de la relance",
          champs: [
            {
              label: "Référence de relance",
              valeur: `REL-${facture.numero || facture.id}`,
            },
            {
              label: "Date de relance",
              valeur: dateRelance,
            },
            {
              label: "Statut de la relance",
              valeur: statutRelance(facture),
            },
          ],
        },
        {
          titre: "Détails de la facture",
          champs: [
            { label: "Numéro de facture", valeur: facture.numero },
            {
              label: "Date de facture",
              valeur: facture.date || "Non définie",
            },
            {
              label: "Date d'échéance",
              valeur: facture.dateEcheance || "Non définie",
            },
            {
              label: "Montant total de la facture",
              valeur: formaterMontant(facture.montant),
            },
            {
              label: "Montant déjà payé",
              valeur: formaterMontant(montantPaye),
            },
            {
              label: "Montant restant dû",
              valeur: formaterMontant(restant),
            },
            {
              label: "Statut de paiement",
              valeur: facture.statut || "En attente",
            },
          ],
        },
      ],
      pied:
        "Merci de procéder au règlement du solde restant. Document généré avec GestionPro.",
    });
  }

  return (
    <section>
      <h1>Relances clients</h1>

      <p className="sous-titre">
        Consultez les soldes restant dus et préparez les relances de paiement.
      </p>

      {lectureSeule && (
        <p className="message-info">
          Mode consultation : vous pouvez consulter les factures impayées,
          mais vous ne pouvez pas préparer de relances.
        </p>
      )}

      <div className="carte">
        <h2>
          Factures à relancer ({facturesARelancer.length})
        </h2>

        {facturesARelancer.length === 0 ? (
          <p className="message-succes">
            Toutes les factures éligibles sont entièrement payées.
          </p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Référence relance</th>
                  <th>Client</th>
                  <th>Facture</th>
                  <th>Montant facture</th>
                  <th>Déjà payé</th>
                  <th>Reste dû</th>
                  <th>Échéance</th>
                  <th>Date relance</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {facturesARelancer.map((facture) => {
                  const client = informationsClient(facture);
                  const montantPaye = totalPaye(facture);
                  const restant = montantRestant(facture);

                  return (
                    <tr key={facture.id}>
                      <td>REL-{facture.numero || facture.id}</td>
                      <td>{client.nom}</td>
                      <td>{facture.numero}</td>
                      <td>{formaterMontant(facture.montant)}</td>
                      <td>{formaterMontant(montantPaye)}</td>
                      <td>
                        <strong>{formaterMontant(restant)}</strong>
                      </td>
                      <td>{facture.dateEcheance || "Non définie"}</td>
                      <td>
                        {new Date().toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        <span className={classeStatutRelance(facture)}>
                          {statutRelance(facture)}
                        </span>
                      </td>
                      <td>
                        <div className="actions-facture">
                          <button
                            type="button"
                            className="bouton petit bouton-pdf"
                            onClick={() => exporterRelancePDF(facture)}
                          >
                            PDF
                          </button>

                          {!lectureSeule && (
                            <button
                              type="button"
                              className="bouton petit"
                              onClick={() => preparerRelance(facture)}
                            >
                              Préparer la relance
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Relances;