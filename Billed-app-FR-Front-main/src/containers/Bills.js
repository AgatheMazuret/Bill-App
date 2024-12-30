import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    $("#modaleFile").modal("show");
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          // Transformer chaque document dans le snapshot
          const bills = snapshot.map((doc) => {
            try {
              // Retourner un nouvel objet avec la date et le statut formatés
              return {
                ...doc, // Copier toutes les propriétés du document
                date: formatDate(doc.date), // Formater la date
                status: formatStatus(doc.status), // Formater le statut
              };
            } catch (e) {
              // Si une erreur se produit, afficher l'erreur et les données problématiques
              console.log(e, "for", doc);
              // Retourner les données sans formatage de la date
              return {
                ...doc, // Copier toutes les propriétés du document
                date: doc.date, // Garder la date non formatée
                status: formatStatus(doc.status), // Formater seulement le statut
              };
            }
          });

          // Afficher la longueur de la liste des factures
          console.log("length", bills.length);

          // Retourner la liste des factures
          return bills;
        });
    }
  };
}
