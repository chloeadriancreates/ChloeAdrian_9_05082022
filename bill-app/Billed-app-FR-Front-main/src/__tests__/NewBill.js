/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import userEvent from '@testing-library/user-event';
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router"
import mockStore from "../__mocks__/store"

jest.mock("../app/Store", () => mockStore)

// Init function for unit tests
function newBillInit() {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))

  const html = NewBillUI();
  document.body.innerHTML = html;

  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }

  const newBillContainer = new NewBill({
    document, onNavigate, store: mockedStore, localStorage: window.localStorage
  })

  const handleSubmit = jest.fn(() => newBillContainer.handleSubmit({
    target: {
      querySelector: (element) => {
        return { value: "" };
      }
    },
    preventDefault: () => { }
  }));

  const buttonSubmit = screen.getByTestId('submit');
  buttonSubmit.addEventListener("click", handleSubmit);

  const buttonFile = screen.getByTestId('file');

  return { 
    newBillContainer: newBillContainer,
    buttonSubmit: buttonSubmit, 
    handleSubmit: handleSubmit,
    buttonFile: buttonFile
  }
}

// Unit tests
describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I select a new file", () => {
      describe("When the file type is correct", () => {
        test("Then the error message should be hidden and the submit button should be clickable", async () => {
          const { newBillContainer, buttonFile, buttonSubmit, handleSubmit } = newBillInit();

          const handleChangeFile = jest.fn(() => newBillContainer.handleChangeFile({
            target: {
              value: 'newbill.jpg',
            },
            preventDefault: () => { }
          }));
      
          buttonFile.addEventListener("change", handleChangeFile);
          fireEvent.change(buttonFile, {
            target: {
              files: [new File(['New Bill'], 'newbill.jpg', { type: 'image/jpg' })],
            },
          })

          userEvent.click(buttonSubmit);

          expect(handleChangeFile).toHaveBeenCalled();
          expect(screen.queryByTestId('errorMessage')).toBeFalsy();
          expect(buttonSubmit.disabled).toBeFalsy();
          expect(handleSubmit).toHaveBeenCalled();
        })
      })

      describe("When the file type is incorrect", () => {
        test("Then an error message should be displayed and the submit button should be disabled", () => {
          const { newBillContainer, buttonFile, buttonSubmit, handleSubmit } = newBillInit();

          const handleChangeFile = jest.fn(() => newBillContainer.handleChangeFile({
            target: {
              value: 'newbill.pdf',
            },
            preventDefault: () => { }
          }));

          buttonFile.addEventListener("change", handleChangeFile);
          fireEvent.change(buttonFile, {
            target: {
              files: [new File(['New Bill'], 'newbill.pdf', { type: 'application/pdf' })],
            },
          })

          userEvent.click(buttonSubmit);
          const errorMessage = screen.getByTestId('errorMessage');

          expect(handleChangeFile).toHaveBeenCalled();
          expect(errorMessage.getAttribute("class")).toContain("errorMessage--shown");
          expect(buttonSubmit.disabled).toBeTruthy();
          expect(handleSubmit).not.toHaveBeenCalled();
        })
      })
    })
  })
})

// Integration tests
describe("Given I am logged in as an employee", () => {
  describe("When I submit the form in NewBill", () => {
    test("The program posts the new bill in mock API", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const newBillContainer = new NewBill({
        document, onNavigate, store: mockedStore, localStorage: window.localStorage
      })

      const updateBill = jest.fn(() => newBillContainer.updateBill());

      updateBill();

      await waitFor(() => screen.getByText("Mes notes de frais"))
      const billType = screen.getAllByText("Hôtel et logement")
      expect(billType).toBeTruthy()
    })

    describe("When an error occurs on the API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      test("The program tries to fetch the bills from the API and fails with a 404 error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("The program tries to fetch the bills from the API and fails with a 500 error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})