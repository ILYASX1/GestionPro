
import { useState } from "react";

function Connexion({ allerInscription, connecter }) {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  function gererConnexion(e) {
    e.preventDefault();

    if (!email.trim() || !motDePasse) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    connecter({ email, motDePasse });
  }

  return (
    <section className="auth-page">
      <div className="auth-carte">
        <div className="auth-logo">
          <div className="auth-marque">
            <img src="/logo.png" alt="Logo GestionPro" />
            <h1>GestionPro</h1>
          </div>

          <p>Connectez-vous à votre espace de gestion.</p>
        </div>

        <h2>Connexion</h2>

        <form className="formulaire" onSubmit={gererConnexion}>
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
            placeholder="Votre mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" className="bouton">
            Se connecter
          </button>
        </form>

        <p className="auth-bas">
          Vous n'avez pas de compte ?{" "}
          <button
            type="button"
            className="auth-lien"
            onClick={allerInscription}
          >
            Créer un compte
          </button>
        </p>
      </div>
    </section>
  );
}

export default Connexion;
