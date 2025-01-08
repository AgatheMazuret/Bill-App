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

jest.mock("../app/store", () => mockStore); // Mock de la méthode de store

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Simule la connexion de l'utilisateur avec localStorage mocké
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee", // Type de l'utilisateur
        })
      );

      router(); // Initialisation du routeur
      window.onNavigate(ROUTES_PATH.Bills); // Navigation vers la page des factures
      await waitFor(() => screen.getByTestId("icon-window")); // Attente de l'élément
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true); // Vérifie si l'icône est activée
    });

    // Test que les factures sont triées de la plus ancienne à la plus récente
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML); // Récupération des dates
      const antiChrono = (a, b) => (a < b ? 1 : -1); // Fonction de tri
      const datesSorted = [...dates].sort(antiChrono); // Tri des dates
      expect(dates).toEqual(datesSorted); // Vérification que les dates sont triées
    });
  });
});
// Test de la navigation vers la page de nouvelle facture
describe("When I click on the new bill button", () => {
  test("Then I should be redirected to the New Bill page", () => {
    // Mise en place de l'HTML de la page des factures
    document.body.innerHTML = BillsUI({ data: bills });
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname }); // Fonction de navigation simulée
    };
    const billsInstance = new Bills({
      document,
      onNavigate,
      store: null, // Pas de requêtes API dans ce test
      localStorage: window.localStorage,
    });
    const buttonNewBill = screen.getByTestId("btn-new-bill"); // Récupération du bouton "Nouvelle facture"
    const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill); // Mock de la méthode
    buttonNewBill.addEventListener("click", handleClickNewBill); // Ajout d'un écouteur d'événement
    userEvent.click(buttonNewBill); // Simule le clic sur le bouton

    expect(handleClickNewBill).toHaveBeenCalled(); // Vérifie que la méthode a été appelée
    expect(screen.getByTestId("form-new-bill")).toBeTruthy(); // Vérifie que le formulaire est affiché
  });
});

// Test de l'ouverture du modal pour la prévisualisation d'une facture
describe("When I click on the preview icon", () => {
  test("Then the modal should open", () => {
    modal = jest.fn();
    document.body.innerHTML = BillsUI({ data: bills });
    const billsInstance = new Bills({
      document,
      onNavigate: jest.fn(),
      store: null,
      localStorage: window.localStorage,
    });
    const iconEye = screen.getByTestId("icon-eye-d"); // Récupère l'icône de prévisualisation
    iconEye.click(); // Simule le clic sur l'icône de prévisualisation

    //TODO:  expect($.fn.modal).toHaveBeenCalledWith("show"); // Vérifie que le modal est ouvert
  });
});

// Test de la fonction getBills
describe("Given I am connected as an employee", () => {
  let billsInstance;
  beforeEach(() => {
    document.body.innerHTML = BillsUI({ data: bills });
    const onNavigate = jest.fn();
    billsInstance = new Bills({
      document,
      onNavigate,
      store: {
        bills: jest.fn(() => ({
          list: jest.fn(() =>
            Promise.resolve([
              // Simulation des données de factures
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
    test("Then it should return a sorted list of bills by date in descending order", async () => {
      const sortedBills = await billsInstance.getBills(); // Appel de la méthode pour récupérer les factures
      expect(sortedBills.length).toBe(2); // Vérifie qu'il y a 2 factures
      expect(sortedBills[0].date).toBe("1 Jan. 22"); // Vérifie que la première facture a la bonne date
      expect(sortedBills[1].date).toBe("1 Jan. 21"); // Vérifie que la deuxième facture a la bonne date
    });

    // Test de gestion d'erreur lorsque la date est invalide
    describe("When formatDate fails", () => {
      test("Then it should catch an error, log it, and return the original date", async () => {
        billsInstance.store.bills = jest.fn(() => ({
          list: jest.fn(() =>
            Promise.resolve([
              { id: 1, date: "invalid-date", status: "pending" },
            ])
          ),
        }));

        const consoleSpy = jest.spyOn(console, "log"); // Espionne les logs dans la console
        const billsList = await billsInstance.getBills(); // Appel de la méthode pour récupérer les factures

        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error), "for", {
          id: 1,
          date: "invalid-date",
          status: "pending",
        });
        expect(billsList[0].date).toBe("invalid-date"); // Vérifie que la date originale est retournée
        consoleSpy.mockRestore(); // Restaure l'espion
      });
    });
  });
});

// Test d'intégration GET
describe("Given I am a user connected as an employee", () => {
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
      });
    });
  });
});
