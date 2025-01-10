/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  // Test unitaire : Vérification que l'icône de facture est mise en surbrillance
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    // Test unitaire : Vérification du tri des factures par date
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    describe("When I click on the new bill button", () => {
      // Test unitaire : Vérification de la redirection après un clic sur le bouton "Nouvelle facture"
      test("Then I should be redirected to the New Bill page", () => {
        // Injecte dans le DOM l'interface utilisateur de la page des notes de frais, avec les données fournies
        document.body.innerHTML = BillsUI({ data: bills });

        // Définit une fonction `onNavigate` qui permet de naviguer entre différentes pages
        // Elle modifie le contenu du DOM en fonction du chemin spécifié
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Création d'une instance de la classe `Bills`
        // Cette classe est utilisée pour gérer les interactions et la logique de la page des notes de frais
        const billsInstance = new Bills({
          // Arguments
          document, // Référence au document HTML (le DOM)
          onNavigate, // Fonction pour gérer la navigation
          store: null, // Aucun store n'est associé ici (simulé ou réel)
          localStorage: window.localStorage, // Référence à l'objet localStorage pour stocker et récupérer des données utilisateur
        });

        const buttonNewBill = screen.getByTestId("btn-new-bill");
        const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill);
        buttonNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(buttonNewBill);

        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });
    });

    describe("When I click on the preview icon", () => {
      // Test unitaire : Vérification de l'ouverture de la modale après un clic sur l'icône de prévisualisation
      test("Then the modal should open", () => {
        $.fn.modal = jest.fn();
        document.body.innerHTML = BillsUI({ data: bills });

        const billsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: null,
          localStorage: window.localStorage,
        });
        const iconEye = screen.getByTestId("icon-eye");
        fireEvent.click(iconEye);
        expect($.fn.modal).toHaveBeenCalledWith("show");
      });
    });
  });

  // Test unitaire : Vérification que les factures sont triées correctement par la méthode getBills
  describe("When I call getBills", () => {
    test("Then it should return a sorted list of bills by date in descending order", async () => {
      const sortedBills = await billsInstance.getBills();
      expect(sortedBills.length).toBe(2);
      expect(sortedBills[0].date).toBe("1 Jan. 22");
      expect(sortedBills[1].date).toBe("1 Jan. 21");
    });

    // Test unitaire : Gestion des erreurs de formatage des dates
    describe("When formatDate fails", () => {
      test("Then it should catch an error, log it, and return the original date", async () => {
        billsInstance.store.bills = jest.fn(() => ({
          list: jest.fn(() =>
            Promise.resolve([
              { id: 1, date: "invalid-date", status: "pending" },
            ])
          ),
        }));
        // Crée un espion pour la méthode console.log afin de pouvoir vérifier si elle a été appelée
        const consoleSpy = jest.spyOn(console, "log");

        // Appel de la méthode getBills() de l'instance de "billsInstance" pour récupérer la liste des Bills
        const billsList = await billsInstance.getBills();

        // Vérifie si console.log a été appelé avec un objet Error, le mot "for", et l'objet facture suivant
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error), "for", {
          id: 1,
          date: "invalid-date",
          status: "pending",
        });

        // Vérifie que la date de la première facture dans la liste est bien "invalid-date"
        expect(billsList[0].date).toBe("invalid-date");

        // Restaure la méthode console.log à son comportement d'origine après le test
        consoleSpy.mockRestore();
      });
    });

    // Test unitaire : Vérification du comportement lorsque le store est nul
    describe("When the store is null", () => {
      test("Then it should return undefined", async () => {
        billsInstance.store = null;
        const result = await billsInstance.getBills();
        expect(result).toBeUndefined();
      });
    });
  });

  // Test d'intégration : Vérification de la récupération des factures via une API simulée
  // Décrit un scénario de test pour la page "Bills"
  describe("When I am on Bills page", () => {
    // Teste la récupération des factures via une API mockée avec la méthode GET
    test("Then fetches bills from mock API GET", async () => {
      // Définit un mock pour le localStorage afin de simuler le stockage local du navigateur
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      // Simule l'ajout d'un utilisateur dans le localStorage
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "employee@test.tld" })
      );

      // Crée un élément div avec un id "root" pour simuler la structure HTML
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);

      // Appelle la fonction router() pour configurer la navigation dans l'application
      router();

      // Simule la navigation vers la page "Bills" en utilisant la méthode onNavigate
      window.onNavigate(ROUTES_PATH.Bills);

      // Espionne la méthode "list" de l'API mockée pour les factures
      const dataMocked = jest.spyOn(mockStore.bills(), "list");

      // Appelle la méthode "list" pour récupérer les factures (via l'API mockée)
      mockStore.bills().list();

      // Attend que la promesse (fetch des données) soit résolue et effectue des assertions
      await waitFor(() => {
        // Vérifie que la méthode "list" a été appelée exactement une fois
        expect(dataMocked).toHaveBeenCalledTimes(1);

        // Vérifie qu'il y a bien 4 lignes (<tr>) dans le tableau (<tbody>)
        expect(document.querySelectorAll("tbody tr").length).toBe(4);

        // Vérifie qu'il y a bien du texte "Mes notes de frais" dans l'élément de la page
        expect(screen.findByText("Mes notes de frais")).toBeTruthy();
      });
    });

    // Décrit un autre scénario de test pour quand une erreur se produit dans l'API
    describe("When an error occurs on API", () => {
      // Avant chaque test, on configure l'environnement (simule le stockage local et la page HTML)
      beforeEach(() => {
        // Espionne la méthode "bills" de l'API mockée
        jest.spyOn(mockStore, "bills");

        // Définit un mock pour le localStorage
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        // Simule l'ajout de l'utilisateur dans le localStorage
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "employee@test.tld" })
        );

        // Crée un élément div avec l'id "root"
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);

        // Appelle la fonction router() pour configurer la navigation de l'application
        router();
      });

      // Après chaque test, on réinitialise tous les mocks
      afterEach(() => {
        jest.clearAllMocks();
      });

      // Test d'intégration : Gestion d'une erreur 404 lors de la récupération des factures
      test("Then fetches bills from an API and fails with 404 message error", async () => {
        // Ici, on simule une réponse de l'API qui échoue en renvoyant une erreur 404
        // "mockImplementationOnce" permet de remplacer temporairement le comportement de la méthode "bills"
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => Promise.reject(new Error("Erreur 404")), // Simule une erreur avec le message "Erreur 404"
          };
        });

        // Simule la navigation vers la page des factures
        window.onNavigate(ROUTES_PATH.Bills);

        // On attend que l'événement de navigation soit pris en compte (process.nextTick permet de déclencher un événement après que l'exécution en cours soit terminée)
        await new Promise(process.nextTick);

        // Cherche le message d'erreur "Erreur 404" dans l'écran
        const message = await screen.getByText(/Erreur 404/);

        // Vérifie que le message d'erreur est présent sur la page
        expect(message).toBeTruthy();
      });

      // Test d'intégration : Gestion d'une erreur 500 lors de la récupération des factures
      test("Then fetches messages from an API and fails with 500 message error", async () => {
        // Simule une réponse de l'API qui échoue en renvoyant une erreur 500
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => Promise.reject(new Error("Erreur 500")), // Simule une erreur avec le message "Erreur 500"
          };
        });

        // Simule la navigation vers la page des factures
        window.onNavigate(ROUTES_PATH.Bills);

        // On attend que l'événement de navigation soit pris en compte
        await new Promise(process.nextTick);

        // Cherche le message d'erreur "Erreur 500" dans l'écran
        const message = await screen.getByText(/Erreur 500/);

        // Vérifie que le message d'erreur est présent sur la page
        expect(message).toBeTruthy();
      });
    });
  });
});
