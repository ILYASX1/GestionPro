
import { useState } from "react";

function MonCompte({ utilisateur, modifierCompte, retour }) {
  const [nom, setNom] = useState(utilisateur?.nom || "");
  const [email, setEmail] = useState(utilisateur?.email || "");
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");

  function gererSoumission(e) {
    e.preventDefault();

    if (!nom.trim() || !email.trim()) {
      alert("Veuillez remplir votre nom et votre adresse email.");
      return;
    }

    if (nouveauMotDePasse || confirmationMotDePasse || motDePasseActuel) {
      if (!motDePasseActuel) {
        alert("Veuillez saisir votre mot de passe actuel.");
        return;
      }

      if (nouveauMotDePasse.length < 6) {
        alert("Le nouveau mot de passe doit contenir au moins 6 caractères.");
        return;
      }

      if (nouveauMotDePasse !== confirmationMotDePasse) {
        alert("La confirmation du nouveau mot de passe ne correspond pas.");
        return;
      }
    }

    const succes = modifierCompte({
      nom: nom.trim(),
      email: email.trim(),
      motDePasseActuel,
      nouveauMotDePasse,
    });

    if (succes) {
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setConfirmationMotDePasse("");
    }
  }

  return (
    <section className="compte-page">
      <header className="compte-entete">
        <div>
          <span className="compte-surtitre">PARAMÈTRES PERSONNELS</span>
          <h1>Mon compte</h1>
          <p>
            Consultez et mettez à jour vos informations personnelles.
          </p>
        </div>

        <div className="compte-role">
          {utilisateur?.role === "administrateur"
            ? "Administrateur"
            : "Gestionnaire"}
        </div>
      </header>

      <form className="compte-carte" onSubmit={gererSoumission}>
        <div className="compte-profil-entete">
          <div className="compte-avatar">
            {(nom || utilisateur?.nom || "U")
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h2>{utilisateur?.nom}</h2>
            <p>{utilisateur?.email}</p>
          </div>
        </div>

        <div className="compte-section">
          <h3>Informations personnelles</h3>
          <p className="compte-description">
            Ces informations sont utilisées pour identifier votre compte.
          </p>

          <div className="compte-champs">
            <div className="compte-champ">
              <label htmlFor="compte-nom">Nom complet</label>
              <input
                id="compte-nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="compte-champ">
              <label htmlFor="compte-email">Adresse email</label>
              <input
                id="compte-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>
        </div>

        <div className="compte-section">
          <h3>Modifier le mot de passe</h3>
          <p className="compte-description">
            Laissez ces champs vides si vous ne souhaitez pas changer votre mot de passe.
          </p>

          <div className="compte-champs compte-champs-motdepasse">
            <div className="compte-champ">
              <label htmlFor="compte-mdp-actuel">
                Mot de passe actuel
              </label>
              <input
                id="compte-mdp-actuel"
                type="password"
                value={motDePasseActuel}
                onChange={(e) => setMotDePasseActuel(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="compte-champ">
              <label htmlFor="compte-nouveau-mdp">
                Nouveau mot de passe
              </label>
              <input
                id="compte-nouveau-mdp"
                type="password"
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div className="compte-champ">
              <label htmlFor="compte-confirmation-mdp">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="compte-confirmation-mdp"
                type="password"
                value={confirmationMotDePasse}
                onChange={(e) =>
                  setConfirmationMotDePasse(e.target.value)
                }
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <div className="compte-section compte-section-lecture">
          <h3>Informations du compte</h3>

          <div className="compte-infos-ligne">
            <span>Rôle</span>
            <strong>
              {utilisateur?.role === "administrateur"
                ? "Administrateur"
                : "Gestionnaire"}
            </strong>
          </div>

          <p className="compte-note">
            Votre rôle est défini par l'application et ne peut pas être
            modifié depuis cette page.
          </p>
        </div>

        <div className="compte-actions">
          <button
            type="button"
            className="compte-bouton-secondaire"
            onClick={retour}
          >
            Annuler
          </button>

          <button type="submit" className="compte-bouton-principal">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </section>
  );
}

export default MonCompte;
