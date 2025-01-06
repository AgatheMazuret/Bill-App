// Importation des chemins des routes depuis un fichier de constantes
import { ROUTES_PATH } from "../constants/routes.js";

// Variable globale pour stocker la dernière localisation (utilisée pour la navigation)
export let PREVIOUS_LOCATION = "";

// Définition de la classe Login pour gérer la logique de connexion
export default class Login {
  // Constructeur de la classe Login
  constructor({
    // Arguments du constructeur
    document, // Document HTML pour manipuler le DOM
    localStorage, // LocalStorage pour stocker les données utilisateur
    onNavigate, // Fonction pour naviguer vers d'autres pages
    PREVIOUS_LOCATION, // Référence à la dernière localisation
    store, // Service pour interagir avec une API ou une base de données
  }) {
    this.document = document;
    // Assigne l'objet "document" passé en argument à la propriété "this.document".
    // Permet à la classe d'interagir avec le DOM (Document Object Model) de la page web.

    this.localStorage = localStorage;
    // Assigne l'objet "localStorage" passé en argument à la propriété "this.localStorage".
    // Utilisé pour stocker et récupérer des données utilisateur dans le stockage local du navigateur.

    this.onNavigate = onNavigate;
    // Assigne la fonction "onNavigate" passée en argument à la propriété "this.onNavigate".
    // Cette fonction est utilisée pour naviguer entre différentes pages ou routes de l'application.

    this.PREVIOUS_LOCATION = PREVIOUS_LOCATION;
    // Assigne la valeur de "PREVIOUS_LOCATION" à la propriété "this.PREVIOUS_LOCATION".
    // Permet de garder une trace de la dernière page visitée (pour gérer la navigation ou revenir en arrière).

    this.store = store;
    // Assigne l'objet "store" passé en argument à la propriété "this.store".
    // "store" est probablement une abstraction pour interagir avec une API ou une base de données.

    // Sélection du formulaire pour les employés et ajout d'un gestionnaire d'événements
    const formEmployee = this.document.querySelector(
      `form[data-testid="form-employee"]`
    );
    formEmployee.addEventListener("submit", this.handleSubmitEmployee);

    // Sélection du formulaire pour les administrateurs et ajout d'un gestionnaire d'événements
    const formAdmin = this.document.querySelector(
      `form[data-testid="form-admin"]`
    );
    formAdmin.addEventListener("submit", this.handleSubmitAdmin);
  }

  // Méthode pour gérer la soumission du formulaire employé
  handleSubmitEmployee = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Création d'un objet utilisateur pour un employé
    const user = {
      type: "Employee",
      email: e.target.querySelector(`input[data-testid="employee-email-input"]`)
        .value, // Récupère l'email de l'employé
      password: e.target.querySelector(
        `input[data-testid="employee-password-input"]`
      ).value, // Récupère le mot de passe de l'employé
      status: "connected",
    };

    // Stocke les informations de l'utilisateur dans le localStorage
    this.localStorage.setItem("user", JSON.stringify(user));

    // Tente de connecter l'utilisateur
    this.login(user)
      .catch((err) => this.createUser(user)) // Si l'utilisateur n'existe pas, le crée
      .then(() => {
        // Redirige vers la page des factures
        this.onNavigate(ROUTES_PATH["Bills"]);
        this.PREVIOUS_LOCATION = ROUTES_PATH["Bills"];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;

        // Réinitialise la couleur de fond de la page
        this.document.body.style.backgroundColor = "#fff";
      });
  };

  // Méthode pour gérer la soumission du formulaire administrateur
  handleSubmitAdmin = (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Création d'un objet utilisateur pour un administrateur
    const user = {
      type: "Admin",
      email: e.target.querySelector(`input[data-testid="admin-email-input"]`)
        .value, // Récupère l'email de l'administrateur
      password: e.target.querySelector(
        `input[data-testid="admin-password-input"]`
      ).value, // Récupère le mot de passe de l'administrateur
      status: "connected",
    };

    // Stocke les informations de l'utilisateur dans le localStorage
    this.localStorage.setItem("user", JSON.stringify(user));

    // Tente de connecter l'utilisateur
    this.login(user)
      .catch((err) => this.createUser(user)) // Si l'utilisateur n'existe pas, le crée
      .then(() => {
        // Redirige vers le tableau de bord
        this.onNavigate(ROUTES_PATH["Dashboard"]);
        this.PREVIOUS_LOCATION = ROUTES_PATH["Dashboard"];
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;

        // Réinitialise la couleur de fond de la page
        document.body.style.backgroundColor = "#fff";
      });
  };

  // Méthode pour connecter un utilisateur existant (non testée directement)
  login = (user) => {
    if (this.store) {
      // Envoie une requête de connexion via le store
      return this.store
        .login(
          JSON.stringify({
            email: user.email, // Email de l'utilisateur
            password: user.password, // Mot de passe de l'utilisateur
          })
        )
        .then(({ jwt }) => {
          // Stocke le jeton JWT dans le localStorage
          localStorage.setItem("jwt", jwt);
        });
    } else {
      return null; // Si le store n'existe pas, ne fait rien
    }
  };

  // Méthode pour créer un nouvel utilisateur
  createUser = (user) => {
    if (this.store) {
      // Envoie une requête de création d'utilisateur via le store
      return this.store
        .users()
        .create({
          data: JSON.stringify({
            type: user.type, // Type de l'utilisateur (Employee ou Admin)
            name: user.email.split("@")[0], // Nom basé sur l'email
            email: user.email, // Email de l'utilisateur
            password: user.password, // Mot de passe de l'utilisateur
          }),
        })
        .then(() => {
          console.log(`User with ${user.email} is created`);
          return this.login(user); // Connecte l'utilisateur après sa création
        });
    } else {
      return null; // Si le store n'existe pas, ne fait rien
    }
  };
}
