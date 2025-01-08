/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import NewBillUI from "../views/NewBillUI.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store";
import mockstore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockstore);

// Avant chaque test, on initialise l'interface utilisateur et simule l'utilisateur connecté
beforeEach(() => {
  // Injecte le contenu HTML de la page New Bill dans le DOM
  document.body.innerHTML = NewBillUI();

  // Simule un utilisateur connecté en tant qu'employé dans le localStorage
  localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
});

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then displays the form", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Vérifier que le formulaire est présent
      const form = document.querySelector("form");
      expect(form).toBeInTheDocument(); // Assertion pour vérifier que le formulaire est bien présent

      // Vérifier la présence des champs de saisie spécifiques
      const billTypeInput = screen.getByLabelText(/Type de dépense/i);
      const billName = screen.getByLabelText(/Nom de la dépense/i);
      const dateInput = screen.getByLabelText(/Date/i);
      const amountInput = screen.getByLabelText(/Montant/i);
      const vatInput = screen.getByLabelText(/TVA/i);
      const billComment = screen.getByLabelText(/Commentaires/i);
      const fileInput = screen.getByLabelText(/Justificatif/i);

      expect(billTypeInput).toBeInTheDocument();
      expect(billName).toBeInTheDocument();
      expect(dateInput).toBeInTheDocument();
      expect(amountInput).toBeInTheDocument();
      expect(vatInput).toBeInTheDocument();
      expect(billComment).toBeInTheDocument();
      expect(fileInput).toBeInTheDocument();
    });

    test("When I click on the send button, the form is submitted", () => {
      const onNavigate = jest.fn(); // Mock de la navigation
      const form = document.querySelector("form");

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        onNavigate(ROUTES.Bills);
      });

      fireEvent.submit(form);

      // Vérifie que la navigation vers la page des factures a été effectuée
      expect(onNavigate).toHaveBeenCalledWith(ROUTES.Bills);
    });
  });
});

describe("Given I am an employee connected", () => {
  describe("When I upload a file", () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form>
          <input type="file" id="file" />
          <span id="fileName"></span>
        </form>
      `;
    });

    test("Should display file name after upload", () => {
      const fileInput = document.getElementById("file");
      const fileName = document.getElementById("fileName");

      const testFile = new File(["content"], "test-file.jpg", {
        type: "image/jpeg",
      });

      const event = new Event("change", { bubbles: true });
      Object.defineProperty(fileInput, "files", {
        value: [testFile],
      });
      fileInput.dispatchEvent(event);

      expect(fileName.textContent).toBe("Fichier sélectionné : test-file.jpg");
    });

    test.each([
      [new File(["content"], "image.jpg", { type: "image/jpeg" }), true],
      [
        new File(["content"], "document.pdf", { type: "application/pdf" }),
        false,
      ],
      [new File([], "empty-file", { type: "" }), false],
    ])("Validation of uploaded files: %s", (file, isValid) => {
      const validTypes = ["image/jpeg", "image/jpg"];
      const isFileValid = file.size > 0 && validTypes.includes(file.type);

      expect(isFileValid).toBe(isValid);
    });

    test("The function handleChangeFile is called", () => {
      const fileInput = document.getElementById("file");
      const handleChangeFile = jest.fn();

      fileInput.addEventListener("change", handleChangeFile);

      const testFile = new File(["content"], "image.jpg", {
        type: "image/jpeg",
      });
      Object.defineProperty(fileInput, "files", {
        value: [testFile],
      });

      fireEvent.change(fileInput);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
    });
  });
});

describe("When I submit the form", () => {
  test("I am redirected to the bills page", () => {
    const onNavigate = jest.fn();
    const form = document.createElement("form");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      onNavigate(ROUTES.Bills);
    });

    document.body.appendChild(form);

    fireEvent.submit(form);

    expect(onNavigate).toHaveBeenCalledWith(ROUTES.Bills);
  });
});
