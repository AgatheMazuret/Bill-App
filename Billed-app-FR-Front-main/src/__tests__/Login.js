/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";
import { localStorageMock } from "../__mocks__/localStorage";

describe("Étant donné que je suis un utilisateur employé sur la page de connexion", () => {
  describe("When I do not fill in the fields and I click on the Employee Login button", () => {
    test("Then, the login page should be rendered", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // Rendu de l'interface utilisateur de la page de connexion
      document.body.innerHTML = LoginUI();

      // Récupération des champs et du formulaire
      const inputEmailUser = screen.getByTestId("employee-email-input");
      const inputPasswordUser = screen.getByTestId("employee-password-input");
      const form = screen.getByTestId("form-employee");

      // Simulation de l'envoi du formulaire sans données

      const handleSubmit = jest.fn((e) => e.preventDefault());
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Vérification que les champs e-mail et mot de passe sont vides
      expect(inputEmailUser.value).toBe("");
      expect(inputPasswordUser.value).toBe("");

      // Vérification que le formulaire existe toujours sur la page
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  // Scénario : l'utilisateur remplit les champs dans un format incorrect et clique sur le bouton de connexion en tant qu'employé
  describe("When I do fill fields in incorrect format and I click on employee login button", () => {
    test("Then It should renders Login page", () => {
      // Mock du localStorage pour simuler le stockage des données utilisateur
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock, // Utilisation d'un mock pour localStorage
      });

      // Ajout d'un utilisateur fictif dans le localStorage
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      // Chargement de l'interface utilisateur de la page de connexion
      document.body.innerHTML = LoginUI();

      // Sélection du formulaire de connexion
      const form = screen.getByTestId("form-employee");

      // Sélection des champs de saisie pour l'e-mail et le mot de passe
      const inputEmailUser = screen.getByTestId("employee-email-input");
      const inputPasswordUser = screen.getByTestId("employee-password-input");

      // Remplissage du champ e-mail avec un format incorrect
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });

      // Remplissage du champ mot de passe avec une valeur quelconque
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });

      // Simulation de la soumission du formulaire
      const handleSubmit = jest.fn((e) => e.preventDefault()); // Mock de la fonction de gestion de soumission
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Vérifie que la valeur saisie dans le champ e-mail est celle avec le format incorrect
      expect(inputEmailUser.value).toBe("pasunemail");

      // Vérifie que la valeur saisie dans le champ mot de passe est correcte
      expect(inputPasswordUser.value).toBe("azerty");

      // Vérifie que le formulaire de connexion est bien présent dans le DOM
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  // Scénario : l'utilisateur remplit les champs dans un format correct et clique sur le bouton de connexion en tant qu'employé
  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      // Mock du localStorage pour simuler le stockage des données utilisateur
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(), // Mock de la méthode getItem
          setItem: jest.fn(), // Mock de la méthode setItem
        },
        writable: true, // Permet de modifier les propriétés du mock
      });

      // Mock pour simuler la navigation vers une autre page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname }); // Charge une nouvelle page
      };

      // Mock de la fonction store (utilisée par l'application)
      const store = jest.fn();

      // Chargement de l'interface utilisateur de la page de connexion
      document.body.innerHTML = LoginUI();

      // Sélection des champs de saisie pour l'e-mail et le mot de passe
      const inputEmailUser = screen.getByTestId("employee-email-input");
      const inputPasswordUser = screen.getByTestId("employee-password-input");

      // Données fictives valides pour les champs de connexion
      const inputData = {
        email: "johndoe@email.com", // Adresse e-mail
        password: "azerty", // Mot de passe
      };

      // Sélection du formulaire de connexion
      const form = screen.getByTestId("form-employee");

      // Variable pour garder une trace de la localisation précédente
      let PREVIOUS_LOCATION = "";

      // Remplissage du champ e-mail avec les données fictives
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

      // Remplissage du champ mot de passe avec les données fictives
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });

      // Création d'une instance de Login pour gérer les actions de connexion
      const login = new Login({
        document, // Document HTML
        localStorage: window.localStorage, // Mock du localStorage
        onNavigate, // Fonction de navigation simulée
        PREVIOUS_LOCATION, // Localisation précédente
        store, // Mock de store
      });

      // Simulation de la soumission du formulaire avec des données valides
      const handleSubmit = jest.fn(login.handleSubmitEmployee); // Mock de la fonction handleSubmit
      login.login = jest.fn().mockResolvedValue({}); // Mock de la méthode login

      // Ajout d'un écouteur d'événement pour le formulaire
      form.addEventListener("submit", handleSubmit);

      // Simulation de la soumission du formulaire
      fireEvent.submit(form);

      // Vérifie que la valeur saisie dans le champ e-mail correspond aux données fictives
      expect(inputEmailUser.value).toBe(inputData.email);

      // Vérifie que la fonction de gestion de soumission a été appelée
      expect(handleSubmit).toHaveBeenCalled();

      // Vérifie les valeurs des champs après soumission
      expect(inputEmailUser.value).toBe(inputData.email);
      expect(inputPasswordUser.value).toBe(inputData.password);

      // Vérifie que les données utilisateur sont correctement enregistrées dans le localStorage
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user", // Clé utilisée dans le localStorage
        JSON.stringify({
          type: "Employee", // Type d'utilisateur
          email: inputData.email, // E-mail
          password: inputData.password, // Mot de passe
          status: "connected", // Statut de connexion
        })
      );
    });

    // Vérifie que la page des notes de frais est affichée
    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

describe("Given that I am a user admin on login page", () => {
  // Scénario : l'administrateur ne remplit pas les champs et clique sur le bouton de connexion admin
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      // Mock du localStorage pour simuler le stockage des données utilisateur
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock, // Utilisation d'un mock pour localStorage
      });

      // Ajout d'un utilisateur fictif de type "Admin" dans le localStorage
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin", // Type d'utilisateur : Admin
        })
      );

      // Initialisation de l'interface utilisateur de la page de connexion
      document.body.innerHTML = LoginUI();

      // Sélection des champs de saisie pour l'e-mail et le mot de passe de l'admin
      const inputEmailUser = screen.getByTestId("admin-email-input");
      const inputPasswordUser = screen.getByTestId("admin-password-input");

      // Sélection du formulaire de connexion de l'admin
      const form = screen.getByTestId("form-admin");

      // Mock de la fonction de soumission du formulaire (empêche la soumission réelle)
      const handleSubmit = jest.fn((e) => e.preventDefault());

      // Ajout d'un écouteur d'événement pour le formulaire
      form.addEventListener("submit", handleSubmit);

      // Simulation de la soumission du formulaire sans données
      fireEvent.submit(form);

      // Vérifie que le champ e-mail de l'admin est vide après la soumission
      expect(inputEmailUser.value).toBe("");

      // Vérifie que le champ mot de passe de l'admin est vide après la soumission
      expect(inputPasswordUser.value).toBe("");

      // Vérifie que le formulaire existe toujours sur la page après la soumission
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  // Scénario : l'administrateur remplit les champs dans un format incorrect et clique sur le bouton de connexion admin
  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      // Mock du localStorage pour simuler le stockage des données utilisateur
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock, // Utilisation d'un mock pour simuler localStorage
      });

      // Ajout d'un utilisateur fictif dans le localStorage avec un type 'Employee'
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee", // Type d'utilisateur : Employé
        })
      );
      // Mock de la fonction de soumission du formulaire (empêche la soumission réelle)
      const handleSubmit = jest.fn((e) => e.preventDefault());

      // Initialisation de l'interface utilisateur de la page de connexion
      document.body.innerHTML = LoginUI();

      // Sélection des champs de saisie pour l'e-mail et le mot de passe de l'admin
      const inputEmailUser = screen.getByTestId("admin-email-input");
      const inputPasswordUser = screen.getByTestId("admin-password-input");

      // Sélection du formulaire de connexion de l'admin
      const form = screen.getByTestId("form-admin");

      // Remplissage des champs de saisie avec des données invalides
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });

      // Ajout d'un écouteur d'événement pour la soumission du formulaire
      form.addEventListener("submit", handleSubmit);

      // Simulation de la soumission du formulaire
      fireEvent.submit(form);

      // Vérifie que le formulaire est toujours présent sur la page après la soumission
      expect(screen.getByTestId("form-admin")).toBeTruthy();

      // Vérifie que la valeur saisie dans le champ e-mail est celle attendue
      expect(inputEmailUser.value).toBe("pasunemail");

      // Vérifie que la valeur saisie dans le champ mot de passe est celle attendue
      expect(inputPasswordUser.value).toBe("azerty");
    });
  });

  // Scénario : l'administrateur remplit les champs dans un format correct et clique sur le bouton de connexion admin
  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      // Mock du localStorage pour simuler le stockage des données utilisateur
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null), // Simule la méthode getItem (aucune donnée retournée)
          setItem: jest.fn(() => null), // Simule la méthode setItem (aucune action)
        },
        writable: true, // Permet de modifier ces valeurs
      });

      // Mock de la navigation vers une autre page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname }); // Change le contenu de la page
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn(); // Simule un store (pour gérer l'état de l'application)

      // Initialisation de l'interface utilisateur de la page de connexion
      document.body.innerHTML = LoginUI();

      // Données valides à insérer dans les champs de formulaire
      const inputData = {
        type: "Admin", // Type d'utilisateur : Admin
        email: "johndoe@email.com", // Adresse e-mail de l'admin
        password: "azerty", // Mot de passe de l'admin
        status: "connected", // Statut de connexion
      };

      // Sélection des champs de saisie pour l'e-mail et le mot de passe de l'admin
      const inputEmailUser = screen.getByTestId("admin-email-input");
      const inputPasswordUser = screen.getByTestId("admin-password-input");
      const form = screen.getByTestId("form-admin");

      // Remplissage du champ e-mail avec l'adresse valide
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });

      // Remplissage du champ mot de passe avec un mot de passe valide
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });

      // Création d'une instance de Login pour gérer la connexion
      const login = new Login({
        document, // Document HTML
        localStorage: window.localStorage, // Mock du localStorage
        onNavigate, // Fonction de navigation simulée
        PREVIOUS_LOCATION, // Localisation précédente
        store, // Simule un store
      });

      // Simulation de l'envoi du formulaire avec des données valides
      const handleSubmit = jest.fn(login.handleSubmitAdmin); // Fonction de gestion de soumission
      login.login = jest.fn().mockResolvedValue({}); // Mock de la méthode login pour simuler la connexion

      // Ajout d'un écouteur d'événement pour le formulaire
      form.addEventListener("submit", handleSubmit);

      // Simulation de la soumission du formulaire
      fireEvent.submit(form);

      // Vérifie que le mot de passe saisi est bien celui attendu
      expect(inputPasswordUser.value).toBe(inputData.password);

      // Vérifie que l'e-mail saisi est bien celui attendu
      expect(inputEmailUser.value).toBe(inputData.email);

      // Vérifie que la fonction de gestion de soumission a bien été appelée
      expect(handleSubmit).toHaveBeenCalled();

      // Vérifie que les données utilisateur sont bien enregistrées dans le localStorage
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user", // Clé utilisée dans localStorage
        JSON.stringify({
          type: "Admin", // Type d'utilisateur
          email: inputData.email, // E-mail
          password: inputData.password, // Mot de passe
          status: "connected", // Statut de connexion
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      // Vérifie que la page du tableau de bord RH est bien affichée
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
});
