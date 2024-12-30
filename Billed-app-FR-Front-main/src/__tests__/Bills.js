/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import DashboardFormUI from "../views/DashboardFormUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

// *******************************************************************************************
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
    });
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
  });
});
// ************************************************************************

describe("Employee Dashboard", () => {
  describe("When on the dashboard", () => {
    test("button New Bill should be clickable", () => {
      // Simuler le DOM avec un bouton New Bill (data-testid utilisé pour l'identification)
      document.body.innerHTML = BillsUI({ data: [] });

      // Mock de la fonction onNavigate (utilisé pour vérifier la navigation)
      const onNavigate = jest.fn();

      // Créer une instance de la classe Bills avec les dépendances nécessaires
      const bills = new Bills({
        document: document,
        onNavigate: onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Espionner la méthode handleClickNewBill pour vérifier son appel
      const handleClickNewBillSpy = jest.spyOn(bills, "handleClickNewBill");

      // Récupérer le bouton New Bill en utilisant screen et data-testid
      const buttonNewBill = screen.getByTestId("btn-new-bill");

      // Simuler un clic sur le bouton
      fireEvent.click(buttonNewBill);

      // Vérifier que la méthode handleClickNewBill a été appelée
      expect(handleClickNewBillSpy).toHaveBeenCalled();
      expect(handleClickNewBillSpy).toHaveBeenCalledTimes(1);

      // Restaurer la méthode originale
      handleClickNewBillSpy.mockRestore();
    });
  });
});

describe("Employee Dashboard", () => {
  describe("When on the dashboard", () => {
    test("New Bill should navigate to the new bill page", () => {
      // Mock de onNavigate
      const onNavigateMock = jest.fn();

      // Instance de Bills avec des dépendances simulées
      const bills = new Bills({
        document: document,
        onNavigate: onNavigateMock,
        store: null,
        localStorage: window.localStorage,
      });

      // Appeler handleClickNewBill
      bills.handleClickNewBill();

      // Vérifier si onNavigate a été appelé avec le bon argument
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });
});

// *****************
// handleClickIconEye = (icon) => {
//   const billUrl = icon.getAttribute("data-bill-url");
//   const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
//   $("#modaleFile")
//     .find(".modal-body")
//     .html(
//       `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
//     );
//   $("#modaleFile").modal("show");
// };
// *****************

describe("Given I am connected as an employee", () => {
  describe("When I click on the eye icon", () => {
    test("A modal should open", () => {
      // Créer une instance de Bills
      const bills = new Bills({
        document: document,
        onNavigate: jest.fn(),
        localStorage: window.localStorage,
      });

      // Créer un élément icon
      const icon = document.createElement("div");
      icon.setAttribute("data-bill-url", "test.png");

      // Espionner la méthode handleClickIconEye
      const handleClickIconEyeSpy = jest.spyOn(bills, "handleClickIconEye");

      // Appeler handleClickIconEye avec l'élément icon
      bills.handleClickIconEye(icon);

      // Vérifier que handleClickIconEye a été appelée
      expect(handleClickIconEyeSpy).toHaveBeenCalled();
      expect(handleClickIconEyeSpy).toHaveBeenCalledTimes(1);

      // Restaurer la méthode originale
      handleClickIconEyeSpy.mockRestore();
    });
  });
});

// ***************************************
// iconEye.forEach((icon) => {
//   icon.addEventListener("click", () => this.handleClickIconEye(icon));
// });
// ***************************************

describe("Given I am connected as an employee", () => {
  test("I must be able to click on the eye icon", () => {});
});
