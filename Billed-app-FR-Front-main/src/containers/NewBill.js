import Logout from "./Logout.js";
import { ROUTES_PATH } from "../constants/routes.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;

    // Écouteur pour nettoyer la facture temporaire si l'utilisateur quitte
    window.addEventListener("beforeunload", this.cleanupTempBill);

    new Logout({ document, localStorage, onNavigate });
  }

  handleChangeFile = (e) => {
    e.preventDefault();
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (file && allowedTypes.includes(file.type)) {
      console.log("Fichier valide :", file.name);
      const filePath = e.target.value.split(/\\/g);
      const fileName = filePath[filePath.length - 1];
      const email = JSON.parse(localStorage.getItem("user")).email;

      this.fileName = fileName;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", email);

      // Stocker le fichier temporairement sans créer une facture définitive
      this.store
        .bills()
        .create({
          data: formData,
          headers: { noContentType: true },
        })
        .then(({ fileUrl, key }) => {
          this.fileUrl = fileUrl; // Stocke l'URL du fichier
          this.billId = key; // Stocke l'ID temporaire
        })
        .catch((error) => console.error(error));
    } else {
      alert("Ce type de fichier n'est pas autorisé");
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };
    this.updateBill(bill);
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  cleanupTempBill = () => {
    if (this.billId && this.store) {
      this.store
        .bills()
        .delete({ selector: this.billId })
        .then(() => console.log("Facture temporaire supprimée"))
        .catch((error) =>
          console.error(
            "Erreur lors de la suppression de la facture temporaire :",
            error
          )
        );
    }
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
