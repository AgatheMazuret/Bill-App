import { ROUTES_PATH } from "../constants/routes.js";

export default class Logout {
  // Le constructeur initialise les propriétés de la classe avec les arguments passés
  constructor({ document, onNavigate, localStorage }) {
    this.document = document; // Document HTML pour manipuler le DOM
    this.onNavigate = onNavigate; // Fonction pour naviguer vers d'autres pages
    this.localStorage = localStorage; // Objet localStorage pour gérer les données locales

    // Attache un événement de clic à l'élément avec l'id 'layout-disconnect'
    $("#layout-disconnect").click(this.handleClick);
  }

  // La fonction handleClick est appelée lorsque l'utilisateur clique sur le bouton de déconnexion
  handleClick = (e) => {
    this.localStorage.clear(); // Efface toutes les données stockées dans localStorage
    this.onNavigate(ROUTES_PATH["Login"]); // Navigue vers la page de connexion
  };
}
