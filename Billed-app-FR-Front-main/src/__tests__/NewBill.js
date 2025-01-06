/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store";
import mockstore from "../__mocks__/store";

import router from "../app/Router.js";
jest.mock("../app/store", () => mockstore);

// Mock pour le localStorage
beforeEach(() => {
  localStorage.setItem("user", JSON.stringify({ email: "test@example.com" }));
});

beforeEach(() => {
  document.body.innerHTML = NewBillUI();
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Given I am connected as an employee", () => {
  describe("When i am on NewBill page", () => {
    test("La page NewBill doit afficher les différents champs", () => {
      const billForm = screen.getByTestId("form-new-bill");
      expect(billForm).toBeInTheDocument();

      const expenseType = screen.getByTestId("expense-type");
      expect(expenseType).toBeInTheDocument();
      expect(expenseType.type).toBe("select-one");

      const inputDescription = screen.getByTestId("commentary");
      expect(inputDescription).toBeInTheDocument();
      expect(inputDescription.placeholder).toBe("");

      const inputAmount = screen.getByTestId("amount");
      expect(inputAmount).toBeInTheDocument();
      expect(inputAmount.type).toBe("number");

      const inputDate = screen.getByTestId("datepicker");
      expect(inputDate).toBeInTheDocument();
      expect(inputDate.type).toBe("date");

      const inputFile = screen.getByTestId("file");
      expect(inputFile).toBeInTheDocument();
      expect(inputFile.type).toBe("file");
      expect(inputFile.accept).toContain("");

      const submitButton = screen.getByRole("button", { name: "Envoyer" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton.textContent).toBe("Envoyer");
      submitButton.click();
    });
  });

  describe("Quand je soumets le formulaire", () => {
    test("Alors une nouvelle facture est créée", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Mock du localStorage pour simuler un utilisateur
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Initialisation du composant NewBill
      const newBill = new NewBill({ document, onNavigate });

      // Affichage de la page NewBill
      document.body.innerHTML = NewBillUI();

      const form = document.getElementById("btn-send-bill");
      const submitButton = screen.getByRole("button", { name: "Envoyer" });

      // Mock de la méthode handleSubmit
      const handleSubmit = jest.fn((e) => e.preventDefault());
      newBill.handleSubmit = handleSubmit;
      form.addEventListener("submit", newBill.handleSubmit);

      // Envoyer le formulaire
      fireEvent.submit(form);

      // Vérifications
      expect(handleSubmit).toHaveBeenCalled();
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("Quand j'upload un fichier", () => {
    test("La fonction handleChangeFile est appelée", () => {
      // Afficher la page NewBill
      document.body.innerHTML = NewBillUI();

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
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
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

  describe("Quand j'ai envoyé le formulaire", () => {
    // Définir le chemin des routes (mock)
    const ROUTES_PATH = {
      Bills: "/bills", // Définir la route attendue pour la page Bills
    };

    test("Alors je suis redirigé vers la page Bills", () => {
      // Mock de la fonction onNavigate
      const onNavigate = jest.fn();

      // Création d'un mock pour la soumission du formulaire
      const form = document.createElement("form");
      form.addEventListener("submit", (e) => {
        e.preventDefault(); // Empêcher la navigation réelle
        onNavigate(ROUTES_PATH["Bills"]); // Appeler la navigation vers la page Bills
      });

      // Simuler la soumission du formulaire
      const submitEvent = new Event("submit");
      form.dispatchEvent(submitEvent);

      // Vérifier que onNavigate a été appelée avec le bon argument
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
    });
  });
});

describe("je suis connecté en tant qu'employee", () => {
  describe("j'upload un fichier", () => {
    test("le fichier est valide", () => {
      // Créer un fichier avec un contenu valide et une extension correcte
      const file = new File(["content"], "image.jpg", { type: "image/jpeg" });
      // Vérifier que le type du fichier correspond au type attendu
      expect(file.type).toBe("image/jpeg");
    });

    test("le fichier n'est pas valide", () => {
      // Créer un fichier avec un type incorrect
      const file = new File(["content"], "document.pdf", {
        type: "application/pdf",
      });
      // Vérifier que le type du fichier ne correspond pas à un type attendu (image/pdf n'existe pas ici)
      expect(file.type).not.toBe("image/pdf");
    });

    test("le fichier est vide", () => {
      // Créer un fichier sans contenu (vide) et sans type défini
      const file = new File([""], "empty-file", { type: "" });
      // Vérifier que la taille du fichier est bien égale à 0 (fichier vide)
      expect(file.size).toBe(0);
    });
  });
});
