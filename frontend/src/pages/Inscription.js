
import { useState } from "react";

function Inscription({ allerConnexion, inscrire }) {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");

  function gererInscription(e) {
    e.preventDefault();

    if (motDePasse !== confirmation) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    if (motDePasse.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    inscrire({
      nom: nom.trim(),
      email: email.trim(),
      motDePasse: motDePasse,
    });
  }

  return (
    <section className="auth-page">
      <div className="auth-carte">
        <div className="auth-logo">
          <h1>GestionPro</h1>
          <p>Créez votre espace de gestion.</p>
        </div>

        <h2>Créer un compte</h2>

        <form className="formulaire" onSubmit={gererInscription}>
          <label htmlFor="nom">Nom complet</label>
          <input
            id="nom"
            type="text"
            placeholder="Votre nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            autoComplete="name"
            required
          />

          <label htmlFor="email">Adresse email</label>
          <input
            id="email"
            type="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="motDePasse">Mot de passe</label>
          <input
            id="motDePasse"
            type="password"
            placeholder="6 caractères minimum"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />

          <label htmlFor="confirmation">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmation"
            type="password"
            placeholder="Retapez votre mot de passe"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button type="submit" className="bouton">
            Créer mon compte
          </button>
        </form>

        <p className="auth-bas">
          Vous avez déjà un compte ?{" "}
          <button
            type="button"
            className="auth-lien"
            onClick={allerConnexion}
          >
            Se connecter
          </button>
        </p>
      </div>
    </section>
  );
}

export default Inscription;
