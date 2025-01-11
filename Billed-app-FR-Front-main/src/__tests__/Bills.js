/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"; // Import de Testing Library pour interagir avec le DOM
import userEvent from "@testing-library/user-event"; // Import pour simuler des événements utilisateur (clics, saisie...)
import BillsUI from "../views/BillsUI.js"; // Import de l'UI des factures
import { bills } from "../fixtures/bills.js"; // Import des données de test pour les factures
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"; // Import des constantes de routes
import { localStorageMock } from "../__mocks__/localStorage.js"; // Mock du localStorage pour les tests
import mockStore from "../__mocks__/store"; // Mock du store utilisé pour simuler les interactions avec une API
import Bills from "../containers/Bills.js"; // Import de la classe Bills qui gère la logique des factures

import router from "../app/Router.js"; // Import du router qui gère la navigation dans l'application
jest.mock("../app/store", () => mockStore); // Mock de l'API de store pour simuler la récupération des données

// Test l'interface utilisateur de la page des factures
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // Test unitaire : Ce test vérifie le comportement de l'interface utilisateur lorsqu'on navigue vers la page des factures
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Ce test vérifie si l'icône de la fenêtre est bien mise en surbrillance lorsque l'utilisateur est sur la page des factures

      // On définit un mock de localStorage pour simuler l'environnement d'un utilisateur connecté
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      // On simule l'enregistrement de l'utilisateur en tant qu'employé dans le localStorage
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee", // L'utilisateur est un employé
        })
      );

      // Création d'un élément HTML pour le root de l'application (le container principal)
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // On appelle le routeur pour naviguer vers la page des factures
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // On attend que l'icône de la fenêtre soit présente dans le DOM
      await waitFor(() => screen.getByTestId("icon-window"));

      // On récupère l'icône de la fenêtre
      const windowIcon = screen.getByTestId("icon-window");

      // On vérifie que l'icône de la fenêtre contient la classe "active-icon", ce qui signifie qu'elle est mise en surbrillance
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      // Test unitaire : Ce test vérifie que les factures sont bien triées par date de la plus ancienne à la plus récente

      // On génère l'UI avec les données de factures fournies
      document.body.innerHTML = BillsUI({ data: bills });

      // On récupère toutes les dates des factures affichées
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML); // On extrait la date en format texte

      // Fonction pour trier les dates en ordre décroissant (de la plus récente à la plus ancienne)
      const antiChrono = (a, b) => (a < b ? 1 : +1);
      const datesSorted = [...dates].sort(antiChrono);

      // On vérifie que les dates récupérées sont bien triées de la plus récente à la plus ancienne
      expect(dates).toEqual(datesSorted);
    });

    describe("When I click on the new bill button", () => {
      // Test d'intégration : Ce test vérifie le comportement du système lorsqu'on clique sur le bouton "nouvelle facture"
      test("Then I should be redirected to the New Bill page", () => {
        // Ce test vérifie que lorsque l'utilisateur clique sur le bouton "nouvelle facture",
        // il est redirigé vers la page pour ajouter une nouvelle facture

        // On configure le HTML pour afficher les factures
        document.body.innerHTML = BillsUI({ data: bills });

        // Fonction de navigation simulée qui change le contenu de la page
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        // On crée une instance de la classe Bills, avec un mock du store (pas d'appel API ici)
        const billsInstance = new Bills({
          document,
          onNavigate,
          store: null, // Pas de requête API dans ce test, juste une simulation d'interaction
          localStorage: window.localStorage,
        });

        // On sélectionne le bouton "nouvelle facture" dans l'interface
        const buttonNewBill = screen.getByTestId("btn-new-bill");

        // On crée une fonction mock pour simuler le clic sur ce bouton
        const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill);

        // On ajoute un écouteur d'événement pour simuler le clic sur le bouton
        buttonNewBill.addEventListener("click", handleClickNewBill);

        // On simule le clic de l'utilisateur sur le bouton
        userEvent.click(buttonNewBill);

        // On vérifie que la fonction de gestion du clic a bien été appelée
        expect(handleClickNewBill).toHaveBeenCalled();

        // On vérifie que le formulaire pour ajouter une nouvelle facture est affiché
        expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      });
    });

    describe("When I click on the preview icon", () => {
      // Test unitaire : Ce test vérifie le comportement de la modal lorsque l'on clique sur l'icône de prévisualisation
      test("Then the modal should open", () => {
        // Ce test vérifie que lorsque l'utilisateur clique sur l'icône de prévisualisation,
        // la modal de prévisualisation de la facture doit s'ouvrir

        // On mock la fonction $.fn.modal pour simuler l'ouverture de la modal
        $.fn.modal = jest.fn();

        // On configure un HTML avec l'icône de prévisualisation et une modal cachée
        document.body.innerHTML = `
					<div data-testid="icon-eye" data-bill-url="https://example.com/bill.jpg"></div>
					<div id="modaleFile">
						<div class="modal-body"></div>
					</div>
				`;

        // On crée une instance de la classe Bills
        const billsInstance = new Bills({
          document,
          onNavigate: jest.fn(),
          store: null,
          localStorage: window.localStorage,
        });

        // On sélectionne l'icône de prévisualisation
        const iconEye = screen.getByTestId("icon-eye");

        // On simule un clic sur l'icône de prévisualisation
        iconEye.click();

        // On vérifie que la modal s'est bien ouverte en appelant la méthode modal avec "show"
        expect($.fn.modal).toHaveBeenCalledWith("show");
      });
    });
  });
});

// Test de la fonction getBills (fonction interne des factures)
describe("Given I am connected as an employee", () => {
  let billsInstance;
  beforeEach(() => {
    // Ce bloc de code s'exécute avant chaque test pour configurer l'environnement de test

    // On configure l'UI avec les données de factures simulées
    document.body.innerHTML = BillsUI({ data: bills });

    // On configure un mock de store pour simuler la récupération des factures via l'API
    const onNavigate = jest.fn();
    billsInstance = new Bills({
      document,
      onNavigate,
      store: {
        bills: jest.fn(() => ({
          list: jest.fn(() =>
            Promise.resolve([
              // Simulation de factures retournées par l'API
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
    // Test unitaire : Ce test vérifie le fonctionnement de la méthode getBills pour trier les factures
    test("Then it should return a sorted list of bills by date in descending order", async () => {
      // Ce test vérifie que la méthode getBills retourne les factures triées par date, de la plus récente à la plus ancienne

      const sortedBills = await billsInstance.getBills();
      expect(sortedBills.length).toBe(2); // On vérifie qu'il y a bien 2 factures
      expect(sortedBills[0].date).toBe("1 Jan. 22"); // Vérification de la date de la facture la plus récente
      expect(sortedBills[1].date).toBe("1 Jan. 21"); // Vérification de la date de la facture la plus ancienne
    });

    describe("When formatDate fails", () => {
      // Test unitaire : Ce test vérifie le comportement lorsque la fonction formatDate échoue
      test("Then it should catch an error, log it, and return the original date", async () => {
        // Ce test vérifie que si une erreur se produit lors du formatage d'une date, l'erreur est capturée et la date originale est retournée

        // Simuler une facture avec une date invalide
        billsInstance.store.bills = jest.fn(() => ({
          list: jest.fn(() =>
            Promise.resolve([
              { id: 1, date: "invalid-date", status: "pending" },
            ])
          ),
        }));

        // On spy sur la méthode console.log pour vérifier si l'erreur est bien loguée
        const consoleSpy = jest.spyOn(console, "log");

        // On récupère les factures, même avec une date invalide
        const billsList = await billsInstance.getBills();

        // On vérifie que l'erreur a bien été loguée
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error), "for", {
          id: 1,
          date: "invalid-date",
          status: "pending",
        });

        // On vérifie que la date de la facture est bien l'originale (et non formatée)
        expect(billsList[0].date).toBe("invalid-date");

        // On restaure le mock de console.log
        consoleSpy.mockRestore();
      });
    });

    describe("When the store is null", () => {
      // Test unitaire : Ce test vérifie le comportement lorsque le store est null
      test("Then it should return undefined", async () => {
        // Ce test vérifie que si le store est null, la méthode getBills retourne undefined

        billsInstance.store = null;

        const result = await billsInstance.getBills();

        // Vérification que le résultat est bien undefined
        expect(result).toBeUndefined();
      });
    });
  });
});

// Test d'intégration pour les appels API GET
describe("Given I am a user connected as an employee", () => {
  describe("When I am on Bills page", () => {
    // Test d'intégration : Ce test vérifie que l'application interagit correctement avec l'API pour récupérer les factures
    test("Then fetches bills from mock API GET", async () => {
      // Ce test d'intégration vérifie que les factures sont récupérées correctement depuis une API simulée

      // Configuration de l'utilisateur dans le localStorage
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

      // Création de l'élément root de l'application pour simuler le chargement de la page
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);

      // On utilise le routeur pour naviguer vers la page des factures
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // On spy sur la méthode de récupération des factures depuis le store mocké
      const dataMocked = jest.spyOn(mockStore.bills(), "list");

      // Simulation de l'appel API pour récupérer les factures
      mockStore.bills().list();

      // On attend que l'appel soit effectué et que les factures apparaissent à l'écran
      await waitFor(() => {
        expect(dataMocked).toHaveBeenCalledTimes(1); // Vérification que l'appel a été effectué une seule fois
        expect(document.querySelectorAll("tbody tr").length).toBe(4); // Vérification qu'il y a bien 4 lignes de factures affichées
        expect(screen.findByText("Mes notes de frais")).toBeTruthy(); // Vérification que le titre est bien affiché
      });
    });

    describe("When an error occurs on API", () => {
      // Test d'intégration : Ce test vérifie la gestion des erreurs lors des appels API pour récupérer les factures
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
        jest.clearAllMocks(); // Nettoyage des mocks après chaque test
      });
      test("Then fetches bills from an API and fails with 404 message error", async () => {
        // Ce test vérifie que si une erreur 404 se produit lors de l'appel API, un message d'erreur 404 est affiché

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        // On navigue vers la page des factures
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);

        // On vérifie que le message d'erreur 404 est affiché
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("Then fetches messages from an API and fails with 500 message error", async () => {
        // Ce test vérifie que si une erreur 500 se produit lors de l'appel API, un message d'erreur 500 est affiché

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        // On navigue vers la page des factures
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);

        // On vérifie que le message d'erreur 500 est affiché
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
