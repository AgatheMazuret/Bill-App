import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    // Bouton pour créer une nouvelle facture
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);

    // Icônes pour visualiser les factures
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye) {
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    }

    // Icônes pour télécharger les factures
    const iconDownload = document.querySelectorAll(
      `div[data-testid="icon-download"]`
    );
    if (iconDownload) {
      iconDownload.forEach((icon) => {
        icon.addEventListener("click", () =>
          this.handleClickDownloadIcon(icon)
        );
      });
    }

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

  handleClickDownloadIcon = (icon) => {
    // Récupère l'URL du fichier à partir de l'attribut 'data-bill-url' de l'icône
    const fileUrl = icon.getAttribute("data-bill-url");

    // Vérifie si l'URL existe
    if (fileUrl) {
      // Crée un élément de lien (a) temporaire pour télécharger le fichier
      const link = document.createElement("a");

      // Définit l'URL du fichier comme href du lien
      link.href = fileUrl;

      // Définit le nom du fichier à télécharger (ici, "bill.jpg")
      const fileName = "bill.jpg";
      link.download = fileName;

      // Ajoute le lien à la page (temporairement) pour qu'il soit cliquable
      document.body.appendChild(link);

      // Simule un clic sur le lien pour lancer le téléchargement
      link.click();

      // Supprime le lien de la page après le téléchargement
      document.body.removeChild(link);
    } else {
      // Si aucune URL de fichier n'est trouvée, affiche une erreur dans la console
      console.error("Aucune URL de fichier trouvée !");
    }
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot
            .map((doc) => {
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status),
                };
              } catch (e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                console.log(e, "for", doc);
                return {
                  ...doc,
                  date: doc.date,
                  status: formatStatus(doc.status),
                };
              }
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
          console.log("length", bills.length);
          return bills;
        });
    }
  };
}
