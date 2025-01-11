/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES_PATH } from "../constants/routes.js";
import store from "../__mocks__/store";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore);

// Test d'intégration : Scénario où l'utilisateur est connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let newBill;
    let onNavigate;

    beforeEach(() => {
      // Avant chaque test, on charge l'UI du formulaire de création de facture
      document.body.innerHTML = NewBillUI();

      // Simulation du localStorage avec des données d'utilisateur
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee", // Type d'utilisateur, ici un employé
        })
      );

      // Simulation de la fonction onNavigate (pour vérifier si la navigation se fait correctement)
      onNavigate = jest.fn();

      // Simulation des méthodes du store pour la gestion des factures (création et mise à jour)
      mockStore.bills = jest.fn(() => ({
        create: jest.fn().mockResolvedValue({
          fileUrl: "https://localhost:3456/images/test.jpg", // URL de l'image après la création
          key: "12345", // Clé de la facture générée
        }),
        update: jest.fn().mockResolvedValue({}), // Méthode de mise à jour de la facture
      }));

      // Initialisation de l'objet newBill avec les dépendances nécessaires
      newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
    });

    // Test d'intégration : vérifie que l'icône "mail" est bien mise en surbrillance lorsqu'on accède à la page NewBill
    test("Then the mail icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router(); // Initialisation du routeur
      window.onNavigate(ROUTES_PATH.NewBill); // Navigation vers la page NewBill
      await waitFor(() => screen.getByTestId("icon-mail")); // Attente que l'icône soit disponible dans le DOM
      const mailIcon = screen.getByTestId("icon-mail"); // Récupération de l'icône "mail"
      expect(mailIcon.classList.contains("active-icon")).toBe(true); // Vérifie que l'icône "mail" a la classe active-icon
    });

    // Test unitaire : vérifie que le formulaire de création de facture est bien affiché
    test("Then the form should be displayed", () => {
      expect(screen.getByTestId("form-new-bill")).toBeTruthy(); // Vérifie que l'élément avec l'ID form-new-bill est présent dans le DOM
    });

    describe("When I upload a file", () => {
      // Test unitaire : vérifie que l'alerte est bien affichée si le type de fichier est invalide
      test("Then it should alert if the file is not a valid type", () => {
        window.alert = jest.fn();
        const fileInput = screen.getByTestId("file");
        const invalidFile = new File(["file"], "file.txt", {
          type: "text/plain",
        });

        fireEvent.change(fileInput, { target: { files: [invalidFile] } });

        expect(window.alert).toHaveBeenCalledWith(
          "Ce type de fichier n'est pas autorisé"
        );
        expect(fileInput.value).toBe("");
      });

      // Test unitaire : vérifie que les informations du fichier sont bien stockées si le fichier est valide
      test("Then it should store fileUrl and fileName if valid", async () => {
        const handleChangeFile = jest.fn(() => newBill.handleChangeFile); // Simulation de la fonction handleChangeFile
        const fileInput = screen.getByTestId("file"); // Récupère l'élément input pour le fichier
        const validFile = new File(["file"], "file.jpg", { type: "image/jpg" }); // Fichier valide (image)

        fireEvent.change(fileInput, { target: { files: [validFile] } }); // Simule un changement de fichier

        await expect(handleChangeFile).toHaveBeenCalled; // Vérifie que handleChangeFile a bien été appelé
        expect(window.alert).not.toBe("Format de fichier non valide"); // Vérifie qu'aucune alerte de format invalide n'a été appelée
      });
    });

    describe("When I click on the submit button", () => {
      // Test unitaire : vérifie que l'envoi du formulaire empêche la soumission par défaut et appelle la méthode updateBill
      test("Then it should prevent the default submission and call updateBill", () => {
        const formNewBill = screen.getByTestId("form-new-bill"); // Récupère le formulaire
        const handleSubmit = jest.spyOn(newBill, "handleSubmit"); // Espionne la fonction handleSubmit

        formNewBill.addEventListener("submit", handleSubmit); // Ajoute un écouteur pour la soumission du formulaire
        fireEvent.submit(formNewBill); // Simule l'envoi du formulaire

        expect(handleSubmit).toHaveBeenCalled(); // Vérifie que handleSubmit a bien été appelé
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]); // Vérifie que la navigation a bien eu lieu vers la page des factures
      });
    });
  });
});

// Test d'intégration POST : vérifie que l'API de création de factures fonctionne comme prévu
describe("Given I am a user connected as Employee", () => {
  describe("When I submit a new bill on NewBill page", () => {
    test("Then it should create a new bill to mock API POST", async () => {
      // Simulation de l'utilisateur connecté dans le localStorage
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee", // Type d'utilisateur : Employee
          email: "employee@test.tld", // Adresse e-mail de l'utilisateur
          status: "connected", // Statut de l'utilisateur
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router(); // Initialisation du routeur
      window.onNavigate(ROUTES_PATH.NewBill); // Navigation vers la page NewBill

      // Espion sur la méthode create du mockStore
      const testData = jest.spyOn(mockStore.bills(), "create");
      const testBill = {
        name: "Facture test", // Nom de la facture
        date: "2024-10-16", // Date de la facture
        type: "Transports", // Type de la facture
        amount: 150, // Montant de la facture
        pct: 20, // Pourcentage de réduction
        vat: "30", // TVA
        fileName: "test.jpg", // Nom du fichier attaché
        fileUrl: "https://test.jpg", // URL du fichier
        commentary: "", // Commentaire
      };

      // Simulation de la création de la facture via l'API mockée
      const testResult = await mockStore.bills().create(testBill);

      expect(testData).toHaveBeenCalled; // Vérifie que la méthode create a bien été appelée
      expect(testResult).toStrictEqual({
        fileUrl: "https://localhost:3456/images/test.jpg",
        key: "12345",
      }); // Vérifie que le résultat retourné par l'API correspond aux valeurs attendues
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills"); // Espionne la méthode bills du mockStore
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee", // Type d'utilisateur : Employee
            email: "employee@test.tld", // Adresse e-mail de l'utilisateur
            status: "connected", // Statut de l'utilisateur
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router(); // Initialisation du routeur
      });

      afterEach(() => {
        jest.clearAllMocks(); // Réinitialisation des mocks après chaque test
      });

      // Test d'intégration : vérifie le cas d'erreur 404 de l'API lors de la création d'une facture
      test("Then it should send the new bill to the API and fail with 404 message error", async () => {
        const error = new Error("Erreur 404");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: jest.fn(() => Promise.reject(new Error("Erreur 404"))), // Simulation d'une erreur 404
          };
        });
        window.onNavigate(ROUTES_PATH.NewBill); // Navigation vers la page NewBill
        await new Promise(process.nextTick); // Attente du traitement
        await expect(mockStore.bills().create({})).rejects.toEqual(error); // Vérifie que l'erreur 404 est bien renvoyée
      });

      // Test d'intégration : vérifie le cas d'erreur 500 de l'API lors de la création d'une facture
      test("Then it should send the new bill to the API and fail with 500 message error", async () => {
        const error = new Error("Erreur 500");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: jest.fn(() => Promise.reject(new Error("Erreur 500"))), // Simulation d'une erreur 500
          };
        });
        window.onNavigate(ROUTES_PATH.NewBill); // Navigation vers la page NewBill
        await new Promise(process.nextTick); // Attente du traitement
        await expect(mockStore.bills().create({})).rejects.toEqual(error); // Vérifie que l'erreur 500 est bien renvoyée
      });
    });
  });
});
