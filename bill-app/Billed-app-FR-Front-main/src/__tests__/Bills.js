/**
 * @jest-environment jsdom
 */

import {getByTestId, getByText, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

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

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on new bill button", () => {
      test("Then I should navigate to New Bill view", () => {
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
          $.fn.modal = jest.fn();
          userEvent.click(iconEye);
  
          expect(handleClickIconEye).toHaveBeenCalled();
          expect($.fn.modal).toHaveBeenCalled();
      })

      describe("When the file is valid", () => {
        test("Then the image should appear in the modal", () => {
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
          iconEye.setAttribute('data-bill-url', "http://localhost:5678/102e956511190da9d67ba21378683187");
          const handleClickIconEye = jest.fn(() => billsContainer.handleClickIconEye(iconEye));
          iconEye.addEventListener("click", handleClickIconEye);
          $.fn.modal = jest.fn();
          userEvent.click(iconEye);
          const billJustif = document.querySelector("img");
          expect(billJustif.src).toContain("102e956511190da9d67ba21378683187");
        })
      })

      describe("When the file is corrupted", () => {
        test("Then text should appear instead of the image", () => {
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
          iconEye.setAttribute('data-bill-url', "http://localhost:5678/null");
          const handleClickIconEye = jest.fn(() => billsContainer.handleClickIconEye(iconEye));
          iconEye.addEventListener("click", handleClickIconEye);
          $.fn.modal = jest.fn();
          userEvent.click(iconEye);
          expect(screen.getByText("Fichier corrompu")).toBeTruthy();
        })
      })
    })
  })
})

// Integration tests
// describe("Given I am logged in as an employee", () => {
//   describe("When I navigate to Bills", () => {
//     test("It fetches bills from mock API GET", async () => {
//       localStorage.setItem("user", JSON.stringify({  type: "Employee" }));
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.Dashboard)
//       await waitFor(() => screen.getByText("Validations"))
//       const contentPending  = await screen.getByText("En attente (1)")
//       expect(contentPending).toBeTruthy()
//       const contentRefused  = await screen.getByText("Refusé (2)")
//       expect(contentRefused).toBeTruthy()
//       expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
//     })
//   describe("When an error occurs on API", () => {
//     beforeEach(() => {
//       jest.spyOn(mockStore, "bills")
//       Object.defineProperty(
//           window,
//           'localStorage',
//           { value: localStorageMock }
//       )
//       window.localStorage.setItem('user', JSON.stringify({
//         type: 'Admin',
//         email: "a@a"
//       }))
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.appendChild(root)
//       router()
//     })
//     test("fetches bills from an API and fails with 404 message error", async () => {

//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 404"))
//           }
//         }})
//       window.onNavigate(ROUTES_PATH.Dashboard)
//       await new Promise(process.nextTick);
//       const message = await screen.getByText(/Erreur 404/)
//       expect(message).toBeTruthy()
//     })

//     test("fetches messages from an API and fails with 500 message error", async () => {

//       mockStore.bills.mockImplementationOnce(() => {
//         return {
//           list : () =>  {
//             return Promise.reject(new Error("Erreur 500"))
//           }
//         }})

//       window.onNavigate(ROUTES_PATH.Dashboard)
//       await new Promise(process.nextTick);
//       const message = await screen.getByText(/Erreur 500/)
//       expect(message).toBeTruthy()
//     })
//   })

//   })
// })