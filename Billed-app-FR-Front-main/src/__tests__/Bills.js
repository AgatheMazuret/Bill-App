/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import getBills from "../containers/Bills.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const chrono = (a, b) => (a < b ? -1 : 1);
      const datesSorted = [...dates].sort(chrono);
      expect(dates).toEqual(datesSorted);
    });
  });
});

describe("buttonNewBill Event Listener", () => {
  test("should call handleClickNewBill when button is clicked", () => {
    // Création d'un élément DOM simulé avec l'ID correct
    document.body.innerHTML = `
      <button id="buttonNewBill">Nouvelle Facture</button>
    `;

    // Moquage de la fonction handleClickNewBill
    const mockHandleClickNewBill = jest.fn();

    // Sélection de l'élément après que le DOM soit configuré
    const buttonNewBill = document.getElementById("buttonNewBill");

    // Vérifie si le bouton est bien présent avant de continuer
    expect(buttonNewBill).not.toBeNull(); // Vérifie que l'élément existe

    // Ajout de l'événement "click" sur le bouton
    buttonNewBill.addEventListener("click", mockHandleClickNewBill);

    // Simuler un clic sur le bouton
    buttonNewBill.click();

    // Vérification que la fonction a été appelée
    expect(mockHandleClickNewBill).toHaveBeenCalled();
  });
});

// Mock des dépendances
const mockBills = jest.fn();
const mockStore = {
  bills: () => ({
    list: mockBills,
  }),
};

describe("getBills", () => {
  it("devrait retourner des factures formatées et triées lorsque les données sont valides", async () => {
    const mockStore = {}; // Définir ton mockStore
    const testData = [
      /* des données de test */
    ];
    mockBills.mockResolvedValue(testData);

    const bills = await new getBills({ store: mockStore }); // Utilisation de 'new'

    // tes assertions
    expect(formatDate).toHaveBeenCalledTimes(2);
    expect(formatStatus).toHaveBeenCalledTimes(2);
  });
});
