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
    e.preventDefault(); // Empêche le rechargement ou comportement par défaut du formulaire

    // Récupère le premier fichier sélectionné dans l'input de type "file"
    const file = this.document.querySelector(`input[data-testid="file"]`)
      .files[0];

    // Liste des types de fichiers autorisés (images uniquement)
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    // Vérifie si un fichier est sélectionné et si son type est autorisé
    if (file && allowedTypes.includes(file.type)) {
      console.log("Fichier valide :", file.name); // Affiche le nom du fichier si valide

      // Récupère le chemin complet du fichier et extrait uniquement le nom du fichier
      const filePath = e.target.value.split(/\\/g);
      const fileName = filePath[filePath.length - 1];

      // Récupère l'email de l'utilisateur à partir du localStorage
      const email = JSON.parse(localStorage.getItem("user")).email;

      // Stocke le nom du fichier dans une propriété de la classe
      this.fileName = fileName;

      // Prépare les données du fichier à envoyer via un formulaire
      const formData = new FormData();
      formData.append("file", file); // Ajoute le fichier
      formData.append("email", email); // Ajoute l'email de l'utilisateur
    } else {
      alert("Ce type de fichier n'est pas autorisé");

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
    }
  };

  handleSubmit = (e) => {
    e.preventDefault(); // Empêche le comportement par défaut du formulaire (rechargement de la page)

    // Affiche la valeur sélectionnée dans le champ de date dans la console pour debug
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );

    // Récupère l'email de l'utilisateur actuellement connecté à partir du localStorage
    const email = JSON.parse(localStorage.getItem("user")).email;

    // Création d'un objet "bill" (facture) contenant toutes les informations saisies dans le formulaire
    const bill = {
      email, // L'email de l'utilisateur
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value, // Type de dépense (ex : transport, nourriture)
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value, // Nom de la dépense
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ), // Montant de la dépense (converti en nombre entier)
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value, // Date de la dépense
      vat: e.target.querySelector(`input[data-testid="vat"]`).value, // TVA associée
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20, // Pourcentage (ex : 20% par défaut si aucune valeur saisie)
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value, // Commentaire facultatif ajouté par l'utilisateur
      fileUrl: this.fileUrl, // URL du fichier téléchargé (associé à la dépense)
      fileName: this.fileName, // Nom du fichier téléchargé
      status: "pending", // Statut initial de la facture (en attente de validation)
    };

    // Envoie la facture on met à jour la base de données locale
    this.updateBill(bill);

    // Redirige l'utilisateur vers la page des factures
    this.onNavigate(ROUTES_PATH["Bills"]);
  };

  cleanupTempBill = () => {
    // Vérifie si une facture temporaire (billId) existe et si le store est disponible
    if (this.billId && this.store) {
      // Appelle la méthode delete() du store pour supprimer la facture temporaire
      this.store
        .bills()
        .delete({ selector: this.billId }) // Supprime la facture identifiée par this.billId
        .then(() =>
          // Affiche un message de confirmation si la suppression réussit
          console.log("Facture temporaire supprimée")
        )
        .catch((error) =>
          // Affiche un message d'erreur si la suppression échoue
          console.error(
            "Erreur lors de la suppression de la facture temporaire :",
            error
          )
        );
    }
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    // Vérifie si le store est disponible (nécessaire pour interagir avec les données)
    if (this.store) {
      // Appelle la méthode update() du store pour mettre à jour une facture existante
      this.store
        .bills() // Accède à la ressource "bills" dans le store
        .update({
          data: JSON.stringify(bill), // Convertit la facture en chaîne JSON pour l'envoyer
          selector: this.billId, // Utilise this.billId pour identifier la facture à mettre à jour
        })
        .then(() => {
          // Une fois la mise à jour réussie, redirige vers la page des factures
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) =>
          // Si une erreur se produit, affiche un message d'erreur dans la console
          console.error(error)
        );
    }
  };
}
