import { formatDate } from "../app/format.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import BigBilledIcon from "../assets/svg/big_billed.js";
import { ROUTES_PATH } from "../constants/routes.js";
import USERS_TEST from "../constants/usersTest.js";
import Logout from "./Logout.js";

export const filteredBills = (data, status) => {
  // Vérifie si les données existent et ont une longueur non nulle
  return data && data.length
    ? data.filter((bill) => {
        let selectCondition;

        // Vérifie si l'environnement est celui des tests (Jest)
        if (typeof jest !== "undefined") {
          // Condition : la facture doit avoir le statut spécifié
          selectCondition = bill.status === status;
        } else {
          /* istanbul ignore next */
          // En environnement de production
          const userEmail = JSON.parse(localStorage.getItem("user")).email; // Récupère l'email de l'utilisateur connecté
          selectCondition =
            bill.status === status && // La facture doit avoir le statut spécifié
            ![...USERS_TEST, userEmail].includes(bill.email); // L'email ne doit pas être dans la liste USERS_TEST ou celui de l'utilisateur connecté
        }

        // Retourne true si la condition est respectée, sinon false
        return selectCondition;
      })
    : []; // Retourne un tableau vide si data est null ou vide
};

export const card = (bill) => {
  // Récupère la partie avant le "@" de l'email (prénom.nom ou autre format)
  const firstAndLastNames = bill.email.split("@")[0];

  // Sépare le prénom et le nom si l'email contient un point (exemple : prénom.nom)
  const firstName = firstAndLastNames.includes(".")
    ? firstAndLastNames.split(".")[0] // Prend la partie avant le premier point comme prénom
    : ""; // Laisse vide si pas de point

  const lastName = firstAndLastNames.includes(".")
    ? firstAndLastNames.split(".")[1] // Prend la partie après le point comme nom
    : firstAndLastNames; // Utilise tout comme nom si pas de point

  // Retourne un bloc HTML représentant une "carte" de facture
  return `
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${
    bill.id
  }'>
      <!-- Conteneur pour le nom -->
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div> <!-- Affiche prénom et nom -->
        <span class='bill-card-grey'> ... </span> <!-- Placeholder graphique -->
      </div>
      <!-- Conteneur pour le nom de la facture et son montant -->
      <div class='name-price-container'>
        <span> ${bill.name} </span> <!-- Nom de la facture -->
        <span> ${bill.amount} € </span> <!-- Montant de la facture -->
      </div>
      <!-- Conteneur pour la date et le type de la facture -->
      <div class='date-type-container'>
        <span> ${formatDate(
          bill.date
        )} </span> <!-- Formate et affiche la date -->
        <span> ${bill.type} </span> <!-- Type de la facture -->
      </div>
    </div>
  `;
};

// Génère les cartes HTML pour toutes les factures
export const cards = (bills) => {
  // Vérifie si le tableau de factures existe et n'est pas vide
  return bills && bills.length
    ? bills
        .map((bill) => card(bill)) // Applique la fonction card() à chaque facture
        .join("") // Combine toutes les cartes générées en une seule chaîne HTML
    : ""; // Retourne une chaîne vide si bills est null ou vide
};

// Renvoie le statut d'une facture en fonction d'un index
export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending";
    case 2:
      return "accepted";
    case 3:
      return "refused";
  }
};

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    // Initialise les propriétés pour manipuler le DOM, la navigation et les données
    this.document = document; // Référence au document HTML
    this.onNavigate = onNavigate; // Fonction pour changer de page
    this.store = store; // Interface pour interagir avec les données (API ou stockage)

    // Suivi de l'état d'ouverture des listes (1, 2, 3)
    this.openStatus = { 1: false, 2: false, 3: false };

    // Attache des gestionnaires d'événements pour chaque icône de liste
    $("#arrow-icon1").click((e) => this.handleShowTickets(e, bills, 1));
    $("#arrow-icon2").click((e) => this.handleShowTickets(e, bills, 2));
    $("#arrow-icon3").click((e) => this.handleShowTickets(e, bills, 3));

    // Instancie la gestion de la déconnexion
    new Logout({ localStorage, onNavigate });
  }

  // Gestion de l'affichage d'une facture dans une modal
  handleClickIconEye = () => {
    const billUrl = $("#icon-eye-d").attr("data-bill-url"); // Récupère l'URL de la facture
    const imgWidth = Math.floor($("#modaleFileAdmin1").width() * 0.8); // Calcule la largeur de l'image
    $("#modaleFileAdmin1")
      .find(".modal-body") // Ajoute l'image dans la modal
      .html(
        `<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} alt="Bill"/></div>`
      );
    if (typeof $("#modaleFileAdmin1").modal === "function")
      $("#modaleFileAdmin1").modal("show"); // Affiche la modal si elle est disponible
  };

  // Gestion de l'édition d'une facture
  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0; // Initialise le compteur si nécessaire
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id; // Met à jour l'ID courant

    if (this.counter % 2 === 0) {
      // Si le compteur est pair, affiche le formulaire de facture
      bills.forEach((b) => {
        $(`#open-bill${b.id}`).css({ background: "#0D5AE5" }); // Réinitialise le style
      });
      $(`#open-bill${bill.id}`).css({ background: "#2A2B35" }); // Met en surbrillance la facture sélectionnée
      $(".dashboard-right-container div").html(DashboardFormUI(bill)); // Affiche le formulaire de modification
      $(".vertical-navbar").css({ height: "150vh" }); // Ajuste la hauteur de la barre latérale
      this.counter++;
    } else {
      // Si le compteur est impair, cache le formulaire et réinitialise l'affichage
      $(`#open-bill${bill.id}`).css({ background: "#0D5AE5" });
      $(".dashboard-right-container div").html(`
        <div id="big-billed-icon" data-testid="big-billed-icon"> ${BigBilledIcon} </div>
      `);
      $(".vertical-navbar").css({ height: "120vh" });
      this.counter++;
    }
    // Attache des gestionnaires pour les boutons de la facture
    $("#icon-eye-d").click(this.handleClickIconEye);
    $("#btn-accept-bill").click((e) => this.handleAcceptSubmit(e, bill));
    $("#btn-refuse-bill").click((e) => this.handleRefuseSubmit(e, bill));
  }

  // Accepter une facture
  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "accepted", // Met à jour le statut à "accepté"
      commentAdmin: $("#commentary2").val(), // Ajoute un commentaire de l'admin
    };
    this.updateBill(newBill); // Met à jour la facture dans le système
    this.onNavigate(ROUTES_PATH["Dashboard"]); // Navigue vers le tableau de bord
  };

  // Refuser une facture
  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: "refused", // Met à jour le statut à "refusé"
      commentAdmin: $("#commentary2").val(), // Ajoute un commentaire de l'admin
    };
    this.updateBill(newBill); // Met à jour la facture dans le système
    this.onNavigate(ROUTES_PATH["Dashboard"]); // Navigue vers le tableau de bord
  };

  // Afficher ou masquer les tickets pour un statut donné
  handleShowTickets(e, bills, index) {
    this.openStatus[index] = !this.openStatus[index]; // Inverse l'état d'ouverture de la liste

    $(`#arrow-icon${index}`).css({
      transform: this.openStatus[index] ? "rotate(0deg)" : "rotate(90deg)", // Met à jour l'icône de flèche
    });

    if (this.openStatus[index]) {
      // Si la liste est ouverte, affiche les factures filtrées
      $(`#status-bills-container${index}`).html(
        cards(filteredBills(bills, getStatus(index))) // Génère les cartes des factures
      );

      // Ajoute un événement "click" pour chaque facture
      filteredBills(bills, getStatus(index)).forEach((bill) => {
        $(`#open-bill${bill.id}`).off("click"); // Supprime d'anciens gestionnaires
        $(`#open-bill${bill.id}`).click(
          (e) => this.handleEditTicket(e, bill, bills) // Attache le gestionnaire d'édition
        );
      });
    } else {
      // Si la liste est fermée, vide le conteneur
      $(`#status-bills-container${index}`).html("");
    }
  }

  // Récupérer toutes les factures pour tous les utilisateurs
  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
        .bills()
        .list() // Récupère la liste des factures via l'API
        .then((snapshot) => {
          const bills = snapshot.map((doc) => ({
            id: doc.id, // ID de la facture
            ...doc, // Autres propriétés de la facture
            date: doc.date, // Date de la facture
            status: doc.status, // Statut de la facture
          }));
          return bills; // Retourne les factures récupérées
        })
        .catch((error) => {
          throw error; // Signale une erreur en cas d'échec
        });
    }
  };

  // Mettre à jour une facture
  updateBill = (bill) => {
    if (this.store) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: bill.id }) // Envoie la mise à jour à l'API
        .then((bill) => bill) // Retourne la facture mise à jour
        .catch(console.log); // Affiche une erreur en cas de problème
    }
  };
}
