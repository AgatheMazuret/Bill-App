/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI"; // Importation du composant d'interface de connexion
import Login from "../containers/Login.js"; // Importation du conteneur de connexion
import { ROUTES } from "../constants/routes"; // Importation des routes définies
import { fireEvent, screen } from "@testing-library/dom"; // Importation de la bibliothèque pour simuler des événements DOM

describe("Given that I am a user on login page", () => {
  // Décrit le test pour un utilisateur sur la page de connexion
  describe("When I do not fill fields and I click on employee button Login In", () => {
    // Cas où l'utilisateur clique sur le bouton de connexion sans remplir les champs
    test("Then It should renders Login page", () => {
      // Vérifie si la page de connexion se rend
      document.body.innerHTML = LoginUI(); // Charge l'interface de connexion dans le DOM

      const inputEmailUser = screen.getByTestId("employee-email-input"); // Récupère l'élément input pour l'email de l'employé
      expect(inputEmailUser.value).toBe(""); // Vérifie que le champ email est vide

      const inputPasswordUser = screen.getByTestId("employee-password-input"); // Récupère l'élément input pour le mot de passe
      expect(inputPasswordUser.value).toBe(""); // Vérifie que le champ mot de passe est vide

      const form = screen.getByTestId("form-employee"); // Récupère le formulaire de connexion de l'employé
      const handleSubmit = jest.fn((e) => e.preventDefault()); // Crée une fonction pour empêcher l'envoi du formulaire

      form.addEventListener("submit", handleSubmit); // Ajoute un écouteur pour l'événement de soumission
      fireEvent.submit(form); // Simule un clic sur le bouton de soumission du formulaire
      expect(screen.getByTestId("form-employee")).toBeTruthy(); // Vérifie que le formulaire est toujours présent
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    // Cas où l'utilisateur remplit les champs avec un format incorrect
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI(); // Charge l'interface de connexion dans le DOM

      const inputEmailUser = screen.getByTestId("employee-email-input"); // Récupère l'élément email
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } }); // Modifie l'email avec une valeur incorrecte
      expect(inputEmailUser.value).toBe("pasunemail"); // Vérifie que l'email est bien changé

      const inputPasswordUser = screen.getByTestId("employee-password-input"); // Récupère l'élément mot de passe
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } }); // Modifie le mot de passe
      expect(inputPasswordUser.value).toBe("azerty"); // Vérifie que le mot de passe est bien changé

      const form = screen.getByTestId("form-employee"); // Récupère le formulaire
      const handleSubmit = jest.fn((e) => e.preventDefault()); // Fonction pour empêcher l'envoi du formulaire

      form.addEventListener("submit", handleSubmit); // Ajoute un écouteur pour l'événement de soumission
      fireEvent.submit(form); // Simule un clic sur le bouton de soumission
      expect(screen.getByTestId("form-employee")).toBeTruthy(); // Vérifie que le formulaire est toujours présent
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    // Cas où l'utilisateur entre un email et un mot de passe corrects
    test("Then I should be identified as an Employee in app", () => {
      // Vérifie que l'utilisateur est identifié comme un employé
      document.body.innerHTML = LoginUI(); // Charge l'interface de connexion
      const inputData = {
        // Données de connexion correctes
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input"); // Récupère le champ email
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } }); // Remplie le champ email avec l'email valide
      expect(inputEmailUser.value).toBe(inputData.email); // Vérifie que l'email est correct

      const inputPasswordUser = screen.getByTestId("employee-password-input"); // Récupère le champ mot de passe
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      }); // Remplie le mot de passe
      expect(inputPasswordUser.value).toBe(inputData.password); // Vérifie que le mot de passe est correct

      const form = screen.getByTestId("form-employee"); // Récupère le formulaire

      // On simule l'ajout des données dans localStorage
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null), // Simule l'absence de données dans localStorage
          setItem: jest.fn(() => null), // Simule l'ajout des données dans localStorage
        },
        writable: true,
      });

      // Simule une navigation dans l'application après la connexion
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname }); // Change la page après la navigation
      };

      let PREVIOUS_LOCATION = ""; // Aucune location précédente pour cet utilisateur

      const store = jest.fn(); // Simule le store de données de l'application

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee); // Crée une fonction pour gérer la soumission du formulaire
      login.login = jest.fn().mockResolvedValue({}); // Simule une connexion réussie
      form.addEventListener("submit", handleSubmit); // Ajoute un écouteur de soumission
      fireEvent.submit(form); // Simule un clic sur le bouton de soumission
      expect(handleSubmit).toHaveBeenCalled(); // Vérifie que la fonction de soumission a été appelée
      expect(window.localStorage.setItem).toHaveBeenCalled(); // Vérifie que les données ont été sauvegardées dans localStorage
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee", // Type d'utilisateur : Employé
          email: inputData.email,
          password: inputData.password,
          status: "connected", // Statut de connexion
        })
      );
    });

    test("It should renders Bills page", () => {
      // Vérifie que la page des notes de frais est affichée après la connexion
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy(); // Vérifie que le texte est présent dans le DOM
    });
  });
});

// Test pour vérifier que la couleur de fond change après une connexion réussie
test("Given successful login, it should change body background color to white", async () => {
  document.body.innerHTML = LoginUI(); // Charge l'interface de connexion

  const inputData = {
    // Données de connexion correctes
    email: "johndoe@email.com",
    password: "azerty",
  };

  const store = {
    login: jest.fn().mockResolvedValueOnce({}), // Simule une réponse de connexion réussie
  };

  const onNavigate = jest.fn(); // Simule la fonction de navigation
  const login = new Login({
    document,
    localStorage: window.localStorage,
    onNavigate,
    PREVIOUS_LOCATION: "",
    store,
  });

  const form = screen.getByTestId("form-employee"); // Récupère le formulaire
  fireEvent.submit(form); // Simule un clic sur le bouton de soumission

  await new Promise(process.nextTick); // Attend la fin de la mise à jour
  expect(document.body.style.backgroundColor).toBe("rgb(255, 255, 255)"); // Vérifie que la couleur de fond a changé en blanc
});

describe("Given that I am a user on login page", () => {
  // Test similaire pour un administrateur
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI(); // Charge l'interface de connexion

      const inputEmailUser = screen.getByTestId("admin-email-input"); // Récupère le champ email de l'administrateur
      expect(inputEmailUser.value).toBe(""); // Vérifie que le champ est vide

      const inputPasswordUser = screen.getByTestId("admin-password-input"); // Récupère le champ mot de passe de l'administrateur
      expect(inputPasswordUser.value).toBe(""); // Vérifie que le champ est vide

      const form = screen.getByTestId("form-admin"); // Récupère le formulaire d'administrateur
      const handleSubmit = jest.fn((e) => e.preventDefault()); // Fonction pour empêcher l'envoi du formulaire

      form.addEventListener("submit", handleSubmit); // Ajoute un écouteur de soumission
      fireEvent.submit(form); // Simule un clic sur le bouton de soumission
      expect(screen.getByTestId("form-admin")).toBeTruthy(); // Vérifie que le formulaire est toujours présent
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI(); // Charge l'interface de connexion

      const inputEmailUser = screen.getByTestId("admin-email-input"); // Récupère l'email de l'administrateur
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } }); // Remplie le champ avec un email incorrect
      expect(inputEmailUser.value).toBe("pasunemail"); // Vérifie que l'email est incorrect

      const inputPasswordUser = screen.getByTestId("admin-password-input"); // Récupère le mot de passe de l'administrateur
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } }); // Remplie le mot de passe
      expect(inputPasswordUser.value).toBe("azerty"); // Vérifie que le mot de passe est correct

      const form = screen.getByTestId("form-admin"); // Récupère le formulaire d'administrateur
      const handleSubmit = jest.fn((e) => e.preventDefault()); // Fonction pour empêcher l'envoi du formulaire

      form.addEventListener("submit", handleSubmit); // Ajoute un écouteur de soumission
      fireEvent.submit(form); // Simule un clic sur le bouton de soumission
      expect(screen.getByTestId("form-admin")).toBeTruthy(); // Vérifie que le formulaire est toujours présent
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    // Cas où l'administrateur remplit correctement les champs
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI(); // Charge l'interface de connexion
      const inputData = {
        // Données de connexion pour un administrateur
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input"); // Récupère le champ email de l'administrateur
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } }); // Remplie l'email
      expect(inputEmailUser.value).toBe(inputData.email); // Vérifie que l'email est correct

      const inputPasswordUser = screen.getByTestId("admin-password-input"); // Récupère le mot de passe de l'administrateur
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      }); // Remplie le mot de passe
      expect(inputPasswordUser.value).toBe(inputData.password); // Vérifie que le mot de passe est correct

      const form = screen.getByTestId("form-admin"); // Récupère le formulaire d'administrateur

      // On simule l'ajout des données dans localStorage
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // Simule une navigation vers le tableau de bord de l'administrateur
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = ""; // Aucune location précédente pour cet utilisateur

      const store = jest.fn(); // Simule le store de données de l'application

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin); // Fonction pour gérer la soumission du formulaire pour l'administrateur
      login.login = jest.fn().mockResolvedValue({}); // Simule une connexion réussie pour l'administrateur
      form.addEventListener("submit", handleSubmit); // Ajoute un écouteur de soumission
      fireEvent.submit(form); // Simule un clic sur le bouton de soumission
      expect(handleSubmit).toHaveBeenCalled(); // Vérifie que la fonction de soumission a été appelée
      expect(window.localStorage.setItem).toHaveBeenCalled(); // Vérifie que les données ont été sauvegardées
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin", // Type d'utilisateur : Admin
          email: inputData.email,
          password: inputData.password,
          status: "connected", // Statut de connexion
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy(); // Vérifie que la page du tableau de bord de l'administrateur est affichée
    });
  });
});
