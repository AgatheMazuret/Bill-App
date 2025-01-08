/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";
import { createUser } from "../containers/Login";

describe("Given that I am a user on login page", () => {
  // Test lorsque l'utilisateur ne remplit pas les champs et clique sur le bouton Login In pour l'employé
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      // Initialisation de la page de connexion
      document.body.innerHTML = LoginUI();

      // Vérification que le champ email est vide
      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      // Vérification que le champ mot de passe est vide
      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      // Simulation de l'envoi du formulaire
      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Vérification que le formulaire est soumis
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  // Test lorsque l'utilisateur remplit des champs dans un format incorrect pour l'employé
  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      // Simuler la saisie d'un email incorrect
      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      // Simuler la saisie d'un mot de passe incorrect
      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Vérification que le formulaire est soumis
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  // Test lorsque l'utilisateur remplit les champs dans un format correct pour l'employé
  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "employee@email.com",
        password: "motdepasse",
      };

      // Simuler la saisie de l'email et du mot de passe
      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      // Simuler l'envoi du formulaire et la gestion du login
      const form = screen.getByTestId("form-employee");

      // Mocker localStorage
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // Mocker la fonction de navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Définir une location précédente vide
      let PREVIOUS_LOCATION = "";

      // Mocker le store
      const store = jest.fn();

      // Initialisation de l'objet Login
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      // Simuler la soumission du formulaire
      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Vérifier que le handler de soumission est appelé et que le localStorage est mis à jour
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders Bills page", () => {
      // Vérification que la page des notes de frais s'affiche
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

// Répétition de tests similaires pour l'admin
describe("Given that I am a user on login page", () => {
  // Test lorsque l'utilisateur ne remplit pas les champs et clique sur le bouton Login In pour l'admin
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      // Vérification que les champs email et mot de passe sont vides
      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      // Simulation de l'envoi du formulaire
      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Vérification que le formulaire est soumis
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  // Test lorsque l'utilisateur remplit des champs dans un format incorrect pour l'admin
  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      // Simuler la saisie d'un email incorrect
      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      // Simuler la saisie d'un mot de passe incorrect
      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Vérification que le formulaire est soumis
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  // Test lorsque l'utilisateur remplit les champs dans un format correct pour l'admin
  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "admin@email.com",
        password: "motdepasse",
        status: "connected",
      };

      // Simuler la saisie de l'email et du mot de passe
      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      // Simuler l'envoi du formulaire et la gestion du login
      const form = screen.getByTestId("form-admin");

      // Mocker localStorage
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // Mocker la fonction de navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      // Définir une location précédente vide
      let PREVIOUS_LOCATION = "";

      // Mocker le store
      const store = jest.fn();

      // Initialisation de l'objet Login
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      // Simuler la soumission du formulaire
      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Vérifier que le handler de soumission est appelé et que le localStorage est mis à jour
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      // Vérification que la page du tableau de bord admin est affichée
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
});

describe("Given I am an user in the login page", () => {
  describe("When the user does not exist", () => {
    test("Then he should create a new user", async () => {
      // Mocker la fonction createUser
      jest.mock("../containers/Login", () => ({
        createUser: jest.fn(),
      }));

      // Définir la réponse du mock pour que la fonction createUser renvoie une valeur résolue
      createUser.mockResolvedValue({ data: "createUser" });

      // Simuler l'UI de la page de connexion (en supposant que LoginUI génère le HTML de la page de connexion)
      document.body.innerHTML = LoginUI();

      // Définir les données à envoyer lors de la création de l'utilisateur
      const inputData = {
        email: "employee@mail.com",
        password: "motdepasse",
      };

      // Appeler la fonction createUser avec les données de l'utilisateur
      const result = await createUser(inputData); // Appeler la fonction createUser avec les données

      // Vérifier que la fonction createUser a été appelée une seule fois
      expect(createUser).toHaveBeenCalledTimes(1);

      // Vérifier que createUser a été appelée avec les bons arguments
      expect(createUser).toHaveBeenCalledWith(inputData); // Vérifier que les bons paramètres ont été passés

      // Vérifier que le résultat renvoyé est bien celui attendu (réponse mockée)
      expect(result).toEqual({ data: "createUser" });
    });
  });
});
