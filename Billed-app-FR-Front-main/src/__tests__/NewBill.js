/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js"; // On importe l'interface utilisateur du formulaire de nouvelle facture
import NewBill from "../containers/NewBill.js"; // On importe le gestionnaire de la logique de la nouvelle facture
import { localStorageMock } from "../__mocks__/localStorage.js"; // On importe un mock de localStorage pour simuler l'environnement local
import { ROUTES_PATH } from "../constants/routes.js"; // On importe les différentes routes de l'application
import store from "../__mocks__/store"; // On importe un mock de store pour simuler les appels à la base de données
import mockStore from "../__mocks__/store"; // Un autre mock du store
import router from "../app/Router.js"; // On importe le routeur pour gérer les changements de pages

// On utilise jest.mock pour simuler le module store
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  // Ce bloc décrit le scénario où un employé est connecté et se trouve sur la page de création d'une facture
  describe("When I am on NewBill Page", () => {
    let newBill; // Variable pour l'objet NewBill qui gère la logique de la page
    let onNavigate; // Fonction pour simuler la navigation vers une autre page

    beforeEach(() => {
      // Avant chaque test, on initialise l'interface utilisateur de la page de création de facture
      document.body.innerHTML = NewBillUI();

      // On remplace localStorage par un mock pour simuler des données de connexion
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee", // L'utilisateur est un employé
        })
      );

      // Fonction qui va être appelée pour simuler la navigation entre les pages
      onNavigate = jest.fn();

      // On configure les méthodes du mock de store pour simuler la création et la mise à jour de factures
      mockStore.bills = jest.fn(() => ({
        create: jest.fn().mockResolvedValue({
          fileUrl: "https://localhost:3456/images/test.jpg", // URL du fichier téléchargé
          key: "12345", // Identifiant unique de la facture
        }),
        update: jest.fn().mockResolvedValue({}),
      }));

      // On crée une instance de la classe NewBill avec les paramètres nécessaires (document, onNavigate, store, etc.)
      newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
    });

    test("Then the mail icon in vertical layout should be highlighted", async () => {
      // Ce test vérifie que l'icône de messagerie est mise en surbrillance dans la barre de navigation

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Initialisation du routeur pour afficher la page "NewBill"
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // On attend que l'icône de messagerie soit présente dans le DOM
      await waitFor(() => screen.getByTestId("icon-mail"));

      const mailIcon = screen.getByTestId("icon-mail");

      // On vérifie que l'icône a bien la classe "active-icon", ce qui signifie qu'elle est mise en surbrillance
      expect(mailIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then the form should be displayed", () => {
      // Ce test vérifie que le formulaire pour ajouter une nouvelle facture est bien affiché
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });

    describe("When I upload a file", () => {
      // Ce bloc contient des tests liés au téléchargement de fichiers (comme une photo de facture)

      test("Then it should alert if the file is not a valid type", () => {
        // Ce test vérifie que si le fichier n'est pas du bon type (ici .txt au lieu de .jpg), une alerte s'affiche

        window.alert = jest.fn(); // On simule la fonction d'alerte pour vérifier son comportement

        const fileInput = screen.getByTestId("file"); // On sélectionne l'input de type fichier (file input)
        const invalidFile = new File(["file"], "file.txt", {
          type: "text/plain", // Type de fichier invalide (il devrait être une image, comme .jpg ou .png)
        });

        // On simule le changement de fichier (l'utilisateur sélectionne le fichier invalide)
        fireEvent.change(fileInput, { target: { files: [invalidFile] } });

        // On vérifie que l'alerte a bien été appelée avec le message "Format de fichier non valide"
        expect(window.alert).toHaveBeenCalledWith(
          "Format de fichier non valide"
        );

        // On vérifie que l'input de fichier a bien été réinitialisé (le fichier a été supprimé)
        expect(fileInput.value).toBe("");
      });

      test("Then it should store fileUrl and fileName if valid", async () => {
        // Ce test vérifie que si le fichier est valide (une image), il est bien stocké

        const handleChangeFile = jest.fn(() => newBill.handleChangeFile); // On espionne la méthode qui gère le changement de fichier
        const fileInput = screen.getByTestId("file"); // Sélectionne l'input de fichier
        const validFile = new File(["file"], "file.jpg", { type: "image/jpg" }); // Crée un fichier valide (une image)

        // On simule le changement de fichier (l'utilisateur sélectionne le fichier valide)
        fireEvent.change(fileInput, { target: { files: [validFile] } });

        // On vérifie que la méthode handleChangeFile a bien été appelée
        await expect(handleChangeFile).toHaveBeenCalled;

        // On vérifie que l'alerte n'a pas été affichée (le fichier est valide)
        expect(window.alert).not.toBe("Format de fichier non valide");
      });
    });

    describe("When I click on the submit button", () => {
      // Ce bloc contient des tests qui vérifient le comportement lors de la soumission du formulaire

      test("Then it should prevent the default submission and call updateBill", () => {
        // Ce test vérifie que la soumission du formulaire empêche l'action par défaut et appelle la méthode updateBill

        const formNewBill = screen.getByTestId("form-new-bill"); // Sélectionne le formulaire
        const handleSubmit = jest.spyOn(newBill, "handleSubmit"); // Espionne la méthode handleSubmit pour voir si elle est appelée

        // On ajoute un écouteur d'événements pour simuler la soumission du formulaire
        formNewBill.addEventListener("submit", handleSubmit);

        // On simule l'envoi du formulaire
        fireEvent.submit(formNewBill);

        // On vérifie que la méthode handleSubmit a bien été appelée
        expect(handleSubmit).toHaveBeenCalled();

        // On vérifie que la fonction onNavigate a bien été appelée avec la bonne route (la page des factures)
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });
    });
  });

  // Ce bloc teste l'intégration de la création d'une nouvelle facture via l'API mockée (simulée)
  describe("When I submit a new bill on NewBill page", () => {
    test("Then it should create a new bill to mock API POST", async () => {
      // Ce test vérifie que la soumission de la facture appelle bien l'API et crée la facture dans le store

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock, // Mock de localStorage pour simuler l'utilisateur connecté
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld", // Email de l'employé connecté
          status: "connected", // Statut de connexion de l'employé
        })
      );

      // On initialise le DOM et le routeur pour afficher la page NewBill
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      // Création des données de test pour une facture
      const testData = jest.spyOn(mockStore.bills(), "create");
      const testBill = {
        name: "Facture test",
        date: "2024-10-16",
        type: "Transports",
        amount: 150,
        pct: 20,
        vat: "30",
        fileName: "test.jpg",
        fileUrl: "https://test.jpg",
        commentary: "",
      };

      // Appel à l'API mockée pour créer la facture
      const testResult = await mockStore.bills().create(testBill);

      // Vérifie que la méthode de création a été appelée et que les résultats sont corrects
      expect(testData).toHaveBeenCalled();
      expect(testResult).toStrictEqual({
        fileUrl: "https://localhost:3456/images/test.jpg",
        key: "12345",
      });
    });

    describe("When an error occurs on API", () => {
      // Ce bloc teste les erreurs possibles lors de l'appel à l'API

      beforeEach(() => {
        jest.spyOn(mockStore, "bills"); // Espionne les appels au store
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "employee@test.tld",
            status: "connected",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });

      afterEach(() => {
        jest.clearAllMocks(); // Nettoie tous les mocks après chaque test
      });

      test("Then it should send the new bill to the API and fail with 404 message error", async () => {
        const error = new Error("Erreur 404");

        // Mocker l'API pour renvoyer une erreur 404
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: jest.fn(() => Promise.reject(new Error("Erreur 404"))),
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick); // Attente que l'API réponde

        // Vérifie que l'erreur 404 est bien renvoyée par l'API
        await expect(mockStore.bills().create({})).rejects.toEqual(error);
      });

      test("Then it should send the new bill to the API and fail with 500 message error", async () => {
        const error = new Error("Erreur 500");

        // Mocker l'API pour renvoyer une erreur 500
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: jest.fn(() => Promise.reject(new Error("Erreur 500"))),
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick); // Attente que l'API réponde

        // Vérifie que l'erreur 500 est bien renvoyée par l'API
        await expect(mockStore.bills().create({})).rejects.toEqual(error);
      });
    });
  });
});
