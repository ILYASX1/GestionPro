
function Relances({ factures, clients }) {
  const facturesImpayees = factures.filter(
    (facture) => facture.statut !== "Payée"
  );

  function nomClient(id) {
    const client = clients.find((c) => c.id === id);
    return client ? client.nom : "Client inconnu";
  }

  function preparerRelance(facture) {
    const client = clients.find(
      (c) => c.id === facture.clientId
    );

    const email = client ? client.email : "Non disponible";

    alert(
      `Relance préparée !\n\n` +
      `Facture : ${facture.numero}\n` +
      `Client : ${nomClient(facture.clientId)}\n` +
      `Email : ${email}\n` +
      `Montant : ${facture.montant} DH\n\n` +
      `Ceci est une simulation. Aucun email n'a été envoyé.`
    );
  }

  return (
    <section>
      <h1>Relances clients</h1>

      <p className="sous-titre">
        Consultez les factures impayées et préparez les relances.
      </p>

      <div className="carte">
        <h2>Factures en attente ({facturesImpayees.length})</h2>

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
                  <th>Montant</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {facturesImpayees.map((facture) => (
                  <tr key={facture.id}>
                    <td>{facture.numero}</td>
                    <td>{nomClient(facture.clientId)}</td>
                    <td>{facture.montant} DH</td>
                    <td>{facture.date}</td>
                    <td>
                      <button
                        className="bouton petit"
                        onClick={() => preparerRelance(facture)}
                      >
                        Préparer la relance
                      </button>
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
