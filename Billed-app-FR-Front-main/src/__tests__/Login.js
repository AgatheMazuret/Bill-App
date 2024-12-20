/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen } from "@testing-library/dom";
import handleSubmitEmployee from "../containers/Login.js";

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
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
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
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
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });

  describe("Quand je clique sur le bouton connexion après avoir rempli les champs", () => {
    describe("Si l'email et le mot de passe n'existent pas", () => {
      test("Alors on crée un nouvel utilisateur et on le connecte", () => {
        // Simuler l'action de remplir le formulaire avec un email et un mot de passe qui n'existent pas
        const email = "nouvelutilisateur@example.com";
        const password = "motdepasse123";

        // Simuler l'appel à la fonction de connexion
        const response = new Login(email, password); // Fonction simulée pour soumettre le formulaire

        // Vérifier que l'utilisateur n'existe pas encore
        expect(response).toBeNull(); // Si l'utilisateur n'existe pas, on suppose qu'on reçoit une réponse null

        // Simuler la création d'un nouvel utilisateur
        const newUser = createUser(email, password); // Fonction simulée pour créer un utilisateur

        // Vérifier que l'utilisateur est bien créé
        expect(newUser).not.toBeNull(); // L'utilisateur ne doit pas être nul après la création

        // Vérifier que l'utilisateur est connecté après la création
        const loginResponse = userLogin(email, password);
        expect(loginResponse).toEqual(newUser); // L'utilisateur nouvellement créé doit être connecté
      });
    });
  });
});

// .catch((err) => this.createUser(user)) // Si l'utilisateur n'existe pas, le crée

describe("Je veux créer un nouvel utilisateur", () => {
  test("Si l'utilisateur n'existe pas, alors je dois créer un nouvel utilisateur", () => {
    // Créer un nouvel utilisateur
    const createUser = (email, password) => {
      const user = {
        type: "Employee",
        email,
        password,
        status: "connected",
      };

      // Stocker les informations de l'utilisateur dans le localStorage
      localStorage.setItem("user", JSON.stringify(user));

      return user;
    };

    // Création d'un nouvel utilisateur
    const email = "newUser@new.fr";
    const password = "motdepasse123";

    // Appel de la fonction pour créer un utilisateur
    const newUser = createUser(email, password, type);

    // Vérification que l'utilisateur a bien été créé
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // Vérifications
    expect(storedUser).toBeDefined(); // Vérifie que l'utilisateur est stocké
    expect(storedUser.email).toBe(email); // Vérifie que l'email est correct
    expect(storedUser.password).toBe(password); // Vérifie que le mot de passe est correct
    expect(storedUser.type).toBe("Employee"); // Vérifie que le type de l'utilisateur est "Employee"
    expect(storedUser.status).toBe("connected"); // Vérifie que le statut est "connected"
  });
  test("L'utilisateur a été créé je l'envoi sur le dashboard", () => {
    storedUser = JSON.parse(localStorage.getItem("user"));
    // On crée un utilisateur
    const email = "newUser@new.fr";
    const password = "motdepasse123";
    createUser(email, password);

    // Récupération de l'utilisateur
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // Test pour vérifier l'envoi sur le dashboard
    expect(storedUser).toBeDefined();
    expect(storedUser.status).toBe("connected");
    window.location.href = "/dashboard";
    const redirect = jest.fn();
    redirect();
    expect(redirect).toHaveBeenCalled();
  });
});
