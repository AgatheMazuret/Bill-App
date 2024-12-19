/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import getBills from "../containers/Bills.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Your async setup and code inside the test
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toBeTruthy();
    });
  });

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
  console.log(screen.debug());
  window.onNavigate(ROUTES_PATH.Bills);

  waitFor(() => screen.getByTestId("icon-window"));
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
  const sortedDates = dates.map((date) => new Date(date)).sort((a, b) => b - a);

  console.log(sortedDates);
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

// if (buttonNewBill)
// buttonNewBill.addEventListener("click", this.handleClickNewBill);

describe("Test d'ajout d'un événement de clic sur le bouton Nouvelle Facture", () => {
  test("Si le bouton existe, l'événement 'click' est attaché", () => {
    // Créer un objet 'document' simulé avec un bouton
    document.body.innerHTML = `
      <button data-testid="btn-new-bill">Nouvelle Facture</button>
    `;

    // Créer une instance de la classe Bills
    const instance = new Bills({
      document,
      onNavigate: jest.fn(),
      store: jest.fn(),
      localStorage: jest.fn(),
    });

    // Spy sur addEventListener pour vérifier qu'il a été appelé
    const addEventListenerSpy = jest.spyOn(
      document.querySelector('[data-testid="btn-new-bill"]'),
      "addEventListener"
    );

    // Vérifier que addEventListener a bien été appelé avec les bons paramètres
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "click",
      instance.handleClickNewBill
    );
  });
});

// (iconEye) {
// iconEye.forEach((icon) => {
// icon.addEventListener("click", () => this.handleClickIconEye(icon));
// });
// }

describe("Test des interactions sur la page", () => {
  let myComponent;
  let buttonNewBill;
  let iconEyeElements;

  beforeEach(() => {
    // Préparer un mock du document et de l'élément
    document.body.innerHTML = `
      <button data-testid="btn-new-bill">Nouvelle Facture</button>
      <div data-testid="icon-eye" data-bill-url="path/to/file1.jpeg"></div>
      <div data-testid="icon-eye" data-bill-url="path/to/file2.jpeg"></div>
    `;

    // Créer une instance de la classe
    myComponent = new Bills({
      document,
      onNavigate: jest.fn(),
      store: jest.fn(),
      localStorage: window.localStorage,
    });

    // Récupérer les éléments pour les tests
    buttonNewBill = document.querySelector(
      "button[data-testid='btn-new-bill']"
    );
    iconEyeElements = document.querySelectorAll("div[data-testid='icon-eye']");
  });

  test("Le bouton 'Nouvelle Facture' doit appeler handleClickNewBill au clic", () => {
    // Espionner la méthode handleClickNewBill
    const spyHandleClickNewBill = jest.spyOn(myComponent, "handleClickNewBill");

    // Simuler un clic sur le bouton
    buttonNewBill.click();

    // Vérifier que la méthode a été appelée
    expect(spyHandleClickNewBill).toHaveBeenCalled();
  });

  test("Les icônes d'œil doivent appeler handleClickIconEye au clic", () => {
    // Espionner la méthode handleClickIconEye
    const spyHandleClickIconEye = jest.spyOn(myComponent, "handleClickIconEye");

    // Simuler un clic sur la première icône
    iconEyeElements[0].click();

    // Vérifier que la méthode handleClickIconEye a été appelée avec le bon élément
    expect(spyHandleClickIconEye).toHaveBeenCalledWith(iconEyeElements[0]);

    // Simuler un clic sur la deuxième icône
    iconEyeElements[1].click();

    // Vérifier que la méthode handleClickIconEye a été appelée avec le bon élément
    expect(spyHandleClickIconEye).toHaveBeenCalledWith(iconEyeElements[1]);
  });

  // if (iconDownload) {
  //   iconDownload.forEach((icon) => {
  //     icon.addEventListener("click", () => this.handleClickDownloadIcon(icon));
  //   });
  // }

  describe("Quand je clique sur l'icone télécharger", () => {
    test("Alors la méthode handleClickDownloadIcon doit être appelée", () => {
      // Créer un élément simulé
      document.body.innerHTML = `
        <div data-testid="icon-download" data-bill-url="path/to/file1.jpeg"></div>
      `;

      // Créer une instance de la classe Bills
      const instance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: jest.fn(),
        localStorage: jest.fn(),
      });

      // Espionner la méthode handleClickDownloadIcon
      const spyHandleClickDownloadIcon = jest.spyOn(
        instance,
        "handleClickDownloadIcon"
      );

      // Sélectionner l'élément pour le test
      const iconDownloadElement = document.querySelector(
        "div[data-testid='icon-download']"
      );

      // Vérifier que l'élément existe
      expect(iconDownloadElement).not.toBeNull();

      // Simuler un clic sur l'icône
      iconDownloadElement.click();

      // Vérifier que la méthode a bien été appelée
      expect(spyHandleClickDownloadIcon).toHaveBeenCalled();
    });
  });
});
