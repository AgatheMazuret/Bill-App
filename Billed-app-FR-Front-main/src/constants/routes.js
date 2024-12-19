// Importation des composants d'interface utilisateur depuis le dossier "views"
import LoginUI from "../views/LoginUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";
import DashboardUI from "../views/DashboardUI.js";

// Définition des chemins des différentes routes de l'application
export const ROUTES_PATH = {
  Login: "/", // Chemin pour la page de connexion
  Bills: "#employee/bills", // Chemin pour la page des factures des employés
  NewBill: "#employee/bill/new", // Chemin pour la page de création d'une nouvelle facture
  Dashboard: "#admin/dashboard", // Chemin pour la page du tableau de bord administrateur
};

// Fonction de routage qui retourne l'interface utilisateur appropriée en fonction du chemin actuel
export const ROUTES = ({ pathname, data, error, loading }) => {
  switch (
    pathname // Vérifie la valeur de "pathname" pour déterminer quelle vue afficher
  ) {
    case ROUTES_PATH["Login"]:
      // Si le chemin est "/", retourne la vue de connexion avec les données fournies
      return LoginUI({ data, error, loading });

    case ROUTES_PATH["Bills"]:
      // Si le chemin est "#employee/bills", retourne la vue des factures avec les données fournies
      return BillsUI({ data, error, loading });

    case ROUTES_PATH["NewBill"]:
      // Si le chemin est "#employee/bill/new", retourne la vue de création d'une nouvelle facture
      return NewBillUI();

    case ROUTES_PATH["Dashboard"]:
      // Si le chemin est "#admin/dashboard", retourne la vue du tableau de bord avec les données fournies
      return DashboardUI({ data, error, loading });

    default:
      // Si le chemin ne correspond à aucune des routes définies, retourne par défaut la vue de connexion
      return LoginUI({ data, error, loading });
  }
};
