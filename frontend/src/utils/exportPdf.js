
function echapperHTML(valeur) {
  return String(valeur ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function exporterDocumentPDF({
  titre,
  numero,
  description,
  sections = [],
  nomFichier,
  pied = "Document généré avec GestionPro",
}) {
  const fenetre = window.open("", "_blank");

  if (!fenetre) {
    alert("Autorisez les fenêtres pop-up pour exporter le PDF.");
    return;
  }

  const sectionsHTML = sections
    .map((section) => `
      <section class="section-document">
        ${section.titre ? `<h2>${echapperHTML(section.titre)}</h2>` : ""}
        <div class="grille">
          ${(section.champs || [])
            .map((champ) => `
              <div class="champ">
                <span class="libelle">${echapperHTML(champ.label)}</span>
                <span class="valeur">${echapperHTML(champ.valeur || "—")}</span>
              </div>
            `)
            .join("")}
        </div>
      </section>
    `)
    .join("");

  fenetre.document.open();

  fenetre.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${echapperHTML(nomFichier || titre)}</title>

  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 38px;
      color: #1e293b;
      background: #fff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
    }

    .document {
      max-width: 900px;
      margin: 0 auto;
    }

    .entete {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      padding-bottom: 22px;
      border-bottom: 3px solid #1d4ed8;
    }

    .marque {
      margin: 0 0 8px;
      color: #1d4ed8;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    h1 {
      margin: 0 0 8px;
      color: #172554;
      font-size: 27px;
    }

    .numero {
      margin: 0;
      color: #64748b;
      font-size: 13px;
    }

    .date-generation {
      color: #64748b;
      text-align: right;
      font-size: 11px;
    }

    .description {
      margin: 22px 0;
      color: #475569;
      line-height: 1.6;
    }

    .section-document {
      margin: 25px 0;
      page-break-inside: avoid;
    }

    .section-document h2 {
      margin: 0 0 13px;
      padding-bottom: 8px;
      border-bottom: 1px solid #dbeafe;
      color: #1e3a8a;
      font-size: 15px;
    }

    .grille {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 13px 24px;
    }

    .champ {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 9px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .libelle {
      color: #64748b;
      font-size: 11px;
    }

    .valeur {
      color: #0f172a;
      font-size: 13px;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    .pied {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      color: #94a3b8;
      font-size: 10px;
      text-align: center;
    }

    @page {
      size: A4;
      margin: 16mm;
    }

    @media print {
      body {
        padding: 0;
      }

      .document {
        max-width: none;
      }
    }
  </style>
</head>

<body>
  <main class="document">
    <header class="entete">
      <div>
        <p class="marque">GestionPro</p>
        <h1>${echapperHTML(titre)}</h1>
        <p class="numero">
          ${numero ? `Référence : ${echapperHTML(numero)}` : ""}
        </p>
      </div>

      <div class="date-generation">
        Document généré le<br />
        ${new Date().toLocaleDateString("fr-FR")}
      </div>
    </header>

    ${description ? `<p class="description">${echapperHTML(description)}</p>` : ""}

    ${sectionsHTML}

    <footer class="pied">
      ${echapperHTML(pied)}
    </footer>
  </main>

  <script>
    window.addEventListener("load", function () {
      window.setTimeout(function () {
        window.focus();
        window.print();
      }, 300);
    });
  </script>
</body>
</html>`);

  fenetre.document.close();
}
