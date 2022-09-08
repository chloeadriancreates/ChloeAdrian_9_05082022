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

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

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
        // Is it worth checking if there's an image when the url is correct?
    })
  })
})
