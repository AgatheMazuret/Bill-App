/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI"; // Importation du composant UI pour la page de login
import Login from "../containers/Login.js"; // Importation du container Login
import { ROUTES } from "../constants/routes"; // Importation des constantes pour la navigation
import { fireEvent, screen } from "@testing-library/dom"; // Importation de l'outil de test pour simuler des événements et interagir avec la DOM

// Début du bloc de test pour la page de login en tant qu'utilisateur "Employee" (employé)
describe("Given that I am a user on login page", () => {
  // Test d'intégration : Vérification de la page de login quand l'utilisateur ne remplit pas les champs
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI(); // On rend le composant LoginUI

      const inputEmailUser = screen.getByTestId("employee-email-input"); // Récupération du champ pour l'email de l'employé
      expect(inputEmailUser.value).toBe(""); // Vérification que le champ email est vide au départ

      const inputPasswordUser = screen.getByTestId("employee-password-input"); // Récupération du champ pour le mot de passe
      expect(inputPasswordUser.value).toBe(""); // Vérification que le champ mot de passe est vide au départ

      const form = screen.getByTestId("form-employee"); // Récupération du formulaire de login de l'employé
      const handleSubmit = jest.fn((e) => e.preventDefault()); // Création d'une fonction factice pour empêcher l'envoi du formulaire

      form.addEventListener("submit", handleSubmit); // Ajout d'un écouteur d'événement pour le formulaire
      fireEvent.submit(form); // Simulation de l'envoi du formulaire
      expect(screen.getByTestId("form-employee")).toBeTruthy(); // Vérification que le formulaire existe toujours
    });
  });

  // Test d'intégration : Vérification de la page de login quand l'utilisateur entre un format incorrect dans les champs
  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI(); // On rend le composant LoginUI

      const inputEmailUser = screen.getByTestId("employee-email-input"); // Récupération du champ email
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } }); // On simule un changement dans le champ email avec un mauvais format
      expect(inputEmailUser.value).toBe("pasunemail"); // Vérification que l'email a bien été modifié

      const inputPasswordUser = screen.getByTestId("employee-password-input"); // Récupération du champ mot de passe
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } }); // On simule un changement dans le champ mot de passe
      expect(inputPasswordUser.value).toBe("azerty"); // Vérification que le mot de passe a bien été modifié

      const form = screen.getByTestId("form-employee"); // Récupération du formulaire de login de l'employé
      const handleSubmit = jest.fn((e) => e.preventDefault()); // Fonction factice pour empêcher l'envoi du formulaire

      form.addEventListener("submit", handleSubmit); // Ajout de l'écouteur d'événements pour le formulaire
      fireEvent.submit(form); // Simulation de l'envoi du formulaire
      expect(screen.getByTestId("form-employee")).toBeTruthy(); // Vérification que le formulaire existe toujours
    });
  });

  // Test unitaire : Vérification que l'employé est bien connecté avec un format correct dans les champs
  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI(); // On rend le composant LoginUI
      const inputData = {
        email: "johndoe@email.com", // Données d'exemple pour un email valide
        password: "azerty", // Mot de passe valide
      };

      const inputEmailUser = screen.getByTestId("employee-email-input"); // Récupération du champ email
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } }); // On simule la saisie de l'email
      expect(inputEmailUser.value).toBe(inputData.email); // Vérification que l'email a bien été saisi

      const inputPasswordUser = screen.getByTestId("employee-password-input"); // Récupération du champ mot de passe
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      }); // On simule la saisie du mot de passe
      expect(inputPasswordUser.value).toBe(inputData.password); // Vérification que le mot de passe a bien été saisi

      const form = screen.getByTestId("form-employee"); // Récupération du formulaire de login

      // Simulation du localStorage pour éviter de manipuler le vrai stockage local
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null), // Fonction factice pour getItem
          setItem: jest.fn(() => null), // Fonction factice pour setItem
        },
        writable: true,
      });

      // Mock de la navigation pour tester le changement de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = ""; // Variable pour la navigation précédente

      const store = jest.fn(); // Fonction factice pour stocker les informations

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee); // Simulation de la soumission du formulaire
      login.login = jest.fn().mockResolvedValue({}); // Simulation de la réussite de la connexion
      form.addEventListener("submit", handleSubmit); // On écoute la soumission du formulaire
      fireEvent.submit(form); // On simule l'envoi du formulaire
      expect(handleSubmit).toHaveBeenCalled(); // Vérification que la fonction de soumission a été appelée
      expect(window.localStorage.setItem).toHaveBeenCalled(); // Vérification que localStorage a été mis à jour
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee", // Le type d'utilisateur est "Employee"
          email: inputData.email, // L'email de l'utilisateur
          password: inputData.password, // Le mot de passe de l'utilisateur
          status: "connected", // Le statut de l'utilisateur est "connected"
        })
      );
    });

    // Test d'intégration : Vérification que la page des notes de frais s'affiche après la connexion
    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy(); // Vérification que la page "Mes notes de frais" est bien affichée
    });
  });
});

// Début du bloc de test pour la page de login en tant qu'utilisateur "Admin" (administrateur)
describe("Given that I am a user on login page", () => {
  // Test d'intégration : Vérification de la page de login quand l'utilisateur admin ne remplit pas les champs
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI(); // On rend le composant LoginUI

      const inputEmailUser = screen.getByTestId("admin-email-input"); // Récupération du champ email de l'admin
      expect(inputEmailUser.value).toBe(""); // Vérification que l'email est vide au départ

      const inputPasswordUser = screen.getByTestId("admin-password-input"); // Récupération du champ mot de passe de l'admin
      expect(inputPasswordUser.value).toBe(""); // Vérification que le mot de passe est vide au départ

      const form = screen.getByTestId("form-admin"); // Récupération du formulaire de login de l'admin
      const handleSubmit = jest.fn((e) => e.preventDefault()); // Fonction factice pour empêcher l'envoi du formulaire

      form.addEventListener("submit", handleSubmit); // Ajout d'un écouteur d'événement pour le formulaire
      fireEvent.submit(form); // Simulation de l'envoi du formulaire
      expect(screen.getByTestId("form-admin")).toBeTruthy(); // Vérification que le formulaire existe toujours
    });
  });

  // Test d'intégration : Vérification de la page de login quand l'utilisateur admin entre un format incorrect dans les champs
  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI(); // On rend le composant LoginUI

      const inputEmailUser = screen.getByTestId("admin-email-input"); // Récupération du champ email de l'admin
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } }); // On simule un changement dans le champ email avec un mauvais format
      expect(inputEmailUser.value).toBe("pasunemail"); // Vérification que l'email a bien été modifié

      const inputPasswordUser = screen.getByTestId("admin-password-input"); // Récupération du champ mot de passe
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } }); // On simule un changement dans le champ mot de passe
      expect(inputPasswordUser.value).toBe("azerty"); // Vérification que le mot de passe a bien été modifié

      const form = screen.getByTestId("form-admin"); // Récupération du formulaire de login
      const handleSubmit = jest.fn((e) => e.preventDefault()); // Fonction factice pour empêcher l'envoi du formulaire

      form.addEventListener("submit", handleSubmit); // Ajout de l'écouteur d'événements pour le formulaire
      fireEvent.submit(form); // Simulation de l'envoi du formulaire
      expect(screen.getByTestId("form-admin")).toBeTruthy(); // Vérification que le formulaire existe toujours
    });
  });

  // Test unitaire : Vérification que l'admin est bien connecté avec des champs remplis correctement
  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI(); // On rend le composant LoginUI
      const inputData = {
        type: "Admin", // Type "Admin" pour l'utilisateur admin
        email: "johndoe@email.com", // Données d'exemple pour un email valide
        password: "azerty", // Mot de passe valide
        status: "connected", // Statut connecté pour l'admin
      };

      const inputEmailUser = screen.getByTestId("admin-email-input"); // Récupération du champ email de l'admin
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } }); // On simule la saisie de l'email
      expect(inputEmailUser.value).toBe(inputData.email); // Vérification que l'email a bien été saisi

      const inputPasswordUser = screen.getByTestId("admin-password-input"); // Récupération du champ mot de passe
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      }); // On simule la saisie du mot de passe
      expect(inputPasswordUser.value).toBe(inputData.password); // Vérification que le mot de passe a bien été saisi

      const form = screen.getByTestId("form-admin"); // Récupération du formulaire de login de l'admin

      // Simulation du localStorage pour éviter de manipuler le vrai stockage local
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null), // Fonction factice pour getItem
          setItem: jest.fn(() => null), // Fonction factice pour setItem
        },
        writable: true,
      });

      // Mock de la navigation pour tester le changement de page
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = ""; // Variable pour la navigation précédente

      const store = jest.fn(); // Fonction factice pour stocker les informations

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin); // Simulation de la soumission du formulaire pour un admin
      login.login = jest.fn().mockResolvedValue({}); // Simulation de la réussite de la connexion
      form.addEventListener("submit", handleSubmit); // On écoute la soumission du formulaire
      fireEvent.submit(form); // On simule l'envoi du formulaire
      expect(handleSubmit).toHaveBeenCalled(); // Vérification que la fonction de soumission a été appelée
      expect(window.localStorage.setItem).toHaveBeenCalled(); // Vérification que localStorage a été mis à jour
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin", // Le type d'utilisateur est "Admin"
          email: inputData.email, // L'email de l'utilisateur
          password: inputData.password, // Le mot de passe de l'utilisateur
          status: "connected", // Le statut de l'utilisateur est "connected"
        })
      );
    });

    // Test d'intégration : Vérification que la page des notes de frais s'affiche après la connexion
    test("It should renders Dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy(); // Vérification que la page "Mes notes de frais" est bien affichée
    });
  });
});
