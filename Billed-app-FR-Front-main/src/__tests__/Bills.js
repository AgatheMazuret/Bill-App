/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
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
  // Test pour vérifier que l'icône des factures est bien mise en surbrillance dans la vue verticale
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // 1. Initialisation du localStorage avec un utilisateur de type Employee
      // On simule un localStorage avec l'outil "localStorageMock" pour manipuler les données du navigateur
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock, // "localStorageMock" est un mock que vous avez défini ailleurs dans votre code
      });
      // L'utilisateur est défini comme étant de type "Employee"
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      // 2. Création de l'élément root et ajout au DOM pour initialiser la navigation
      // Cela permet de simuler l'environnement du navigateur (le DOM) afin de tester la navigation
      const root = document.createElement("div");
      root.setAttribute("id", "root"); // Définit un identifiant unique pour l'élément root
      document.body.append(root); // Ajoute l'élément "root" au body du document

      // 3. Initialisation du système de routage
      // Appel de la fonction "router()" pour initialiser la navigation dans l'application
      router();

      // 4. Navigation vers la page des factures
      // La fonction "onNavigate" est appelée pour simuler la navigation vers la page des factures
      window.onNavigate(ROUTES_PATH.Bills);

      // 5. Vérification de l'icône active dans la barre de navigation
      // On attend que l'icône soit présente dans le DOM
      await waitFor(() => screen.getByTestId("icon-window"));

      // 6. Récupération de l'icône "window" dans la barre de navigation
      const windowIcon = screen.getByTestId("icon-window");

      // 7. Vérification si l'icône a la classe CSS "active-icon" pour indiquer qu'elle est activée
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    // Test pour vérifier que les factures sont triées de la plus ancienne à la plus récente
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      // Récupération de toutes les dates affichées sur la page
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      // Tri des dates de manière anti-chronologique
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);

      // Vérification que les dates sont bien triées
      expect(dates).toEqual(datesSorted);
    });

    describe("When I click on the new bill button", () => {
      // Test pour vérifier que le bouton de nouvelle facture redirige vers la page correspondante
      test("Then I should be redirected to the New Bill page", () => {
        // Initialisation de la page Bills
        document.body.innerHTML = BillsUI({ data: bills });

        // Logique de navigation pour simuler un redirection vers la page de création de facture
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // Création de l'instance Bills avec les fonctions de navigation et de stockage
        const billsInstance = new Bills({
          document,
          onNavigate,
          store: null, // Pas besoin de faire une requête API pour ce test
          localStorage: window.localStorage,
        });

        // Sélection du bouton "Nouvelle facture"
        const buttonNewBill = screen.getByTestId("btn-new-bill");
        const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill);
        buttonNewBill.addEventListener("click", handleClickNewBill);

        // Simulation du clic sur le bouton
        userEvent.click(buttonNewBill);

        // Vérification que la fonction a bien été appelée et que la page de nouvelle facture s'affiche
        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });
    });

    describe("When I click on the preview icon", () => {
      // Test pour vérifier que l'icône de prévisualisation ouvre bien la modale
      test("Then the modal should open", () => {
        // Mock de la fonction modal
        $.fn.modal = jest.fn();

        // Simulation de la structure du DOM avec l'icône de prévisualisation
        document.body.innerHTML = `
          <div data-testid="icon-eye" data-bill-url="https://example.com/bill.jpg"></div>
          <div id="modaleFile">
            <div class="modal-body"></div>
          </div>
        `;

        // Création de l'instance Bills
        const billsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: null,
          localStorage: window.localStorage,
        });

        // Simulation du clic sur l'icône de prévisualisation
        const iconEye = screen.getByTestId("icon-eye");
        iconEye.click();

        // Vérification que la modale s'est bien ouverte
        expect($.fn.modal).toHaveBeenCalledWith("show");
      });
    });
  });

  // Test pour vérifier le bon fonctionnement de la fonction getBills
  let billsInstance;
  beforeEach(() => {
    // Initialisation de l'environnement pour le test
    document.body.innerHTML = BillsUI({ data: bills });
    const onNavigate = jest.fn();
    billsInstance = new Bills({
      document,
      onNavigate,
      store: {
        bills: jest.fn(() => ({
          list: jest.fn(() =>
            Promise.resolve([
              { id: 1, date: "2022-01-01", status: "pending" },
              { id: 2, date: "2021-01-01", status: "accepted" },
            ])
          ),
        })),
      },
      localStorage: window.localStorage,
    });
  });

  describe("When I call getBills", () => {
    // Test pour vérifier que les factures sont bien triées par date, du plus récent au plus ancien
    test("Then it should return a sorted list of bills by date in descending order", async () => {
      const sortedBills = await billsInstance.getBills();

      // Vérification que la liste des factures a bien été triée par date
      expect(sortedBills.length).toBe(2);
      expect(sortedBills[0].date).toBe("1 Jan. 22");
      expect(sortedBills[1].date).toBe("1 Jan. 21");
    });

    describe("When formatDate fails", () => {
      // Test pour vérifier que si formatDate échoue, l'erreur est bien capturée et la date originale est retournée
      test("Then it should catch an error, log it, and return the original date", async () => {
        // Simulation d'une facture avec une date invalide
        billsInstance.store.bills = jest.fn(() => ({
          list: jest.fn(() =>
            Promise.resolve([
              { id: 1, date: "invalid-date", status: "pending" },
            ])
          ),
        }));

        // Lorsque getBills est appelé
        const consoleSpy = jest.spyOn(console, "log");
        const billsList = await billsInstance.getBills();

        // Vérification que l'erreur est bien loggée
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error), "for", {
          id: 1,
          date: "invalid-date",
          status: "pending",
        });

        // Vérification que la date originale est bien retournée
        expect(billsList[0].date).toBe("invalid-date");
        consoleSpy.mockRestore();
      });
    });

    describe("When the store is null", () => {
      // Test pour vérifier que si le store est null, la fonction retourne undefined
      test("Then it should return undefined", async () => {
        billsInstance.store = null;

        const result = await billsInstance.getBills();

        expect(result).toBeUndefined();
      });
    });
  });

  // Test d'intégration GET pour vérifier que les factures sont bien récupérées via l'API
  describe("When I am on Bills page", () => {
    test("Then fetches bills from mock API GET", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills);

      const dataMocked = jest.spyOn(mockStore.bills(), "list");
      mockStore.bills().list();

      await waitFor(() => {
        expect(dataMocked).toHaveBeenCalledTimes(1);
        expect(document.querySelectorAll("tbody tr").length).toBe(4);
        expect(screen.findByText("Mes notes de frais")).toBeTruthy();
      });
    });

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
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
        jest.clearAllMocks();
      });

      test("Then fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("Then fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
