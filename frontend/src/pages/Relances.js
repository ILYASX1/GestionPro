
import { exporterDocumentPDF } from "../utils/exportPdf";

function Relances({
  factures,
  clients,
  paiements,
  lectureSeule = false,
}) {
  function nomClient(id) {
    const client = clients.find((c) => c.id === id);
    return client ? client.nom : "Client inconnu";
  }

  function trouverClient(facture) {
    return clients.find((client) => client.id === facture.clientId);
  }

  function totalPaye(facture) {
    return paiements
      .filter((paiement) => paiement.factureId === facture.id)
      .reduce(
        (total, paiement) => total + Number(paiement.montant || 0),
        0
      );
  }

  function montantRestant(facture) {
    return Math.max(
      0,
      Number(facture.montant || 0) - totalPaye(facture)
    );
  }

  const facturesImpayees = factures.filter(
    (facture) => montantRestant(facture) > 0
  );

  function preparerRelance(facture) {
    if (lectureSeule) return;

    const client = trouverClient(facture);
    const restant = montantRestant(facture);

    alert(
      `Relance préparée !\n\n` +
        `Facture : ${facture.numero}\n` +
        `Client : ${nomClient(facture.clientId)}\n` +
        `Email : ${client?.email || "Non disponible"}\n` +
        `Montant restant : ${restant} DH\n\n` +
        `Ceci est une simulation. Aucun email n'a été envoyé.`
    );
  }

  function exporterRelancePDF(facture) {
    const client = trouverClient(facture);
    const restant = montantRestant(facture);

    exporterDocumentPDF({
      titre: "Relance de paiement",
      numero: facture.numero,
      description:
        "Rappel concernant le règlement du solde restant de la facture ci-dessous.",
      nomFichier: `relance-${facture.numero || facture.id}`,
      sections: [
        {
          titre: "Destinataire",
          champs: [
            { label: "Client", valeur: client?.nom || "Client inconnu" },
            { label: "Email", valeur: client?.email || "Non renseigné" },
            {
              label: "Téléphone",
              valeur: client?.telephone || "Non renseigné",
            },
          ],
        },
        {
          titre: "Détails de la facture",
          champs: [
            { label: "Numéro de facture", valeur: facture.numero },
            { label: "Date de facture", valeur: facture.date },
            {
              label: "Date d'échéance",
              valeur: facture.dateEcheance || "Non définie",
            },
            {
              label: "Montant initial",
              valeur: `${Number(facture.montant || 0).toLocaleString("fr-FR")} DH`,
            },
            {
              label: "Montant déjà payé",
              valeur: `${totalPaye(facture).toLocaleString("fr-FR")} DH`,
            },
            {
              label: "Montant restant dû",
              valeur: `${restant.toLocaleString("fr-FR")} DH`,
            },
            {
              label: "Statut",
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
        Consultez les factures impayées et préparez les relances.
      </p>

      {lectureSeule && (
        <p className="message-info">
          Mode consultation : vous pouvez consulter les factures impayées,
          mais vous ne pouvez pas préparer de relances.
        </p>
      )}

      <div className="carte">
        <h2>
          Factures en attente ({facturesImpayees.length})
        </h2>

        {facturesImpayees.length === 0 ? (
          <p className="message-succes">
            Toutes les factures sont payées.
          </p>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Facture</th>
                  <th>Client</th>
                  <th>Montant restant</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {facturesImpayees.map((facture) => (
                  <tr key={facture.id}>
                    <td>{facture.numero}</td>
                    <td>{nomClient(facture.clientId)}</td>
                    <td>
                      {montantRestant(facture).toLocaleString("fr-FR")} DH
                    </td>
                    <td>{facture.date}</td>
                    <td>{facture.statut}</td>

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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Relances;
