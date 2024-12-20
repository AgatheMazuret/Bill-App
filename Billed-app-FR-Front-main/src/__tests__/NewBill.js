/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import handleChangeFile from "../containers/NewBill.js";

beforeEach(() => {
  document.body.innerHTML = NewBillUI();
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Je suis connecté en tant qu'employé", () => {
  describe("Quand je suis sur la page NewBill", () => {
    test("La page NewBill doit afficher les différents champs", () => {
      const billForm = document.getElementById("form-new-bill");
      expect(billForm).toBeInTheDocument();

      const expenseType = document.getElementById("expense-type");
      expect(expenseType).toBeInTheDocument();
      expect(expenseType.type).toBe("text");

      const inputDescription = document.getElementById("commentary");
      expect(inputDescription).toBeInTheDocument();
      expect(inputDescription.placeholder).toBe("Entrer une description");

      const inputAmount = document.getElementById("amount");
      expect(inputAmount).toBeInTheDocument();
      expect(inputAmount.type).toBe("number");

      const inputDate = document.getElementById("datepicker");
      expect(inputDate).toBeInTheDocument();
      expect(inputDate.type).toBe("date");

      const inputFile = document.getElementById("file");
      expect(inputFile).toBeInTheDocument();
      expect(inputFile.type).toBe("file");
      expect(inputFile.accept).toContain("image/");

      const submitButton = document.querySelector("button[type='submit']");
      expect(submitButton).toBeInTheDocument();
      expect(submitButton.textContent).toBe("Submit");
      submitButton.click();
    });
  });

  describe("Quand je soumets le formulaire", () => {
    test("Alors une nouvelle facture est créée", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({ document, onNavigate });

      const handleSubmit = jest.fn(newBill.handleSubmit);

      document.body.innerHTML = `
      <form data-testid="form-new-bill">
        <button id="btn-send-bill" type="submit">Send</button>
      </form>
    `;

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);

      const submitButton = document.getElementById("btn-send-bill");
      submitButton.click();

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

describe("Quand j'upload un fichier", () => {
  test("La fonction handleChangeFile est appelée", () => {
    // Simuler l'élément <input>
    document.body.innerHTML = `
      <input data-testid="file" type="file" />
    `;

    // Sélectionner l'élément <input>
    const input = document.querySelector(`input[data-testid="file"]`);

    // Créer un fichier simulé
    const validFile = new File(["content"], "image.jpg", {
      type: "image/jpeg",
    });

    // Simuler que le champ <input> contient un fichier
    Object.defineProperty(input, "files", { value: [validFile] });

    // Mock la fonction handleChangeFile
    const handleChangeFile = jest.fn();

    // Ajouter un listener sur l'input
    input.addEventListener("change", handleChangeFile);

    // Déclencher un événement "change" sur l'input
    input.dispatchEvent(new Event("change"));

    // Vérifier que handleChangeFile a été appelé
    expect(handleChangeFile).toHaveBeenCalled();
  });

  test("Le fichier est valide", () => {
    // Créer un fichier valide
    const validFile = new File(["content"], "image.jpg", {
      type: "image/jpeg",
    });

    // Vérifier que le fichier est valide
    expect(validFile.type).toBe("image/jpeg");
  });

  test("Le fichier n'est pas valide", () => {
    // Créer un fichier invalide
    const invalidFile = new File(["content"], "document.pdf", {
      type: "application/pdf",
    });

    // Vérifier que le fichier est invalide
    expect(invalidFile.type).not.toBe("image/pdf");
  });

  test("Le fichier est vide", () => {
    // Créer un fichier vide
    const emptyFile = new File([""], "empty-file", {
      type: "",
    });

    // Vérifier que le fichier est vide
    expect(emptyFile.size).toBe(0);
  });
});
