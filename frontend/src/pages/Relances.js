
function Relances({
  factures,
  clients,
  paiements,
  lectureSeule = false,
}) {
  const facturesImpayees = factures.filter(
    (facture) => facture.statut !== "Payée"
  );

  function nomClient(id) {
    const client = clients.find((c) => c.id === id);
    return client ? client.nom : "Client inconnu";
  }

  function montantRestant(facture) {
    const totalPaye = paiements
      .filter((p) => p.factureId === facture.id)
      .reduce((total, p) => total + Number(p.montant), 0);

    return Math.max(0, Number(facture.montant) - totalPaye);
  }

  function preparerRelance(facture) {
    if (lectureSeule) return;

    const client = clients.find(
      (c) => c.id === facture.clientId
    );

    const email = client ? client.email : "Non disponible";
    const restant = montantRestant(facture);

    alert(
      `Relance préparée !\n\n` +
        `Facture : ${facture.numero}\n` +
        `Client : ${nomClient(facture.clientId)}\n` +
        `Email : ${email}\n` +
        `Montant restant : ${restant} DH\n\n` +
        `Ceci est une simulation. Aucun email n'a été envoyé.`
    );
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

                    <td>{montantRestant(facture)} DH</td>

                    <td>{facture.date}</td>

                    <td>{facture.statut}</td>

                    <td>
                      {lectureSeule ? (
                        <span className="sous-titre">
                          Consultation
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="bouton petit"
                          onClick={() => preparerRelance(facture)}
                        >
                          Préparer la relance
                        </button>
                      )}
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
