/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

beforeEach(() => {
  document.body.innerHTML = NewBillUI();
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Je suis connecté en tant qu'employé", () => {
  describe("Quand je suis sur la page NewBill", () => {
    test("La page NewBill doit s'afficher", () => {});
  });
});
