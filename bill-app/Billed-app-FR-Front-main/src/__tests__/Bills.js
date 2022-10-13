/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore)

function billsInit() {
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }

  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))

  document.body.innerHTML = BillsUI({ data: bills })

  const billsContainer = new Bills({
    document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
  })

  const iconEye = screen.getAllByTestId('icon-eye')[0];
  const handleClickIconEye = jest.fn(() => billsContainer.handleClickIconEye(iconEye));
  iconEye.addEventListener("click", handleClickIconEye);

  return { 
    billsContainer: billsContainer,
    iconEye: iconEye,
    handleClickIconEye: handleClickIconEye
  }
}

// Unit tests
describe("Given I am logged in as an employee", () => {
  describe("When I am on Bills", () => {
    test("Then the bill icon in the vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon).toBeTruthy();
      expect(windowIcon).toHaveClass('active-icon')
    })

    test("Then bills should be ordered from latest to earliest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on new bill button", () => {
      test("Then I should navigate to New Bill view", () => {
        const { billsContainer } = billsInit();
        
        const handleClickNewBill = jest.fn(() => billsContainer.handleClickNewBill());
        const buttonNewBill = screen.getByTestId('btn-new-bill');
        buttonNewBill.addEventListener("click", handleClickNewBill);
        userEvent.click(buttonNewBill);

        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
      })
    })

    describe("When I click on the eye icon", () => {
        test("Then the modal should open", () => {
          const { iconEye, handleClickIconEye } = billsInit();
          
          $.fn.modal = jest.fn();
          userEvent.click(iconEye);
  
          expect(handleClickIconEye).toHaveBeenCalled();
          expect($.fn.modal).toHaveBeenCalled();
      })

      describe("When the file is valid", () => {
        test("Then the image should appear in the modal", () => {
          const { iconEye } = billsInit();
          
          iconEye.setAttribute('data-bill-url', "http://localhost:5678/102e956511190da9d67ba21378683187");
          $.fn.modal = jest.fn();
          userEvent.click(iconEye);
          const billJustif = document.querySelector("img");
          expect(billJustif.src).toContain("102e956511190da9d67ba21378683187");
        })
      })

      describe("When the file is corrupted", () => {
        test("Then text should appear instead of the image", () => {
          const { iconEye } = billsInit();

          iconEye.setAttribute('data-bill-url', "http://localhost:5678/null");
          $.fn.modal = jest.fn();
          userEvent.click(iconEye);
          expect(screen.getByText("Fichier corrompu")).toBeTruthy();
        })
      })
    })
  })
})

// Integration tests
describe("Given I am logged in as an employee", () => {
  describe("When I navigate to Bills", () => {
    test("The program fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({  type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const billType  = screen.getByText("Hôtel et logement")
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
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("The program tries to fetch the bills from the API and fails with a 500 error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })

  })
})