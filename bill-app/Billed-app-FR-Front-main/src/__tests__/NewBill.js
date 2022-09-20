/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import userEvent from '@testing-library/user-event';
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

// I tried using beforeEach() to get rid of the duplicate code in these two tests, but the tests then don't find the functions. I don't know if that's normal behavior or if I did something wrong :')

// beforeEach(() => {
//   Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//   window.localStorage.setItem('user', JSON.stringify({
//     type: 'Employee'
//   }))

//   const html = NewBillUI();
//   document.body.innerHTML = html;

//   const onNavigate = (pathname) => {
//     document.body.innerHTML = ROUTES({ pathname })
//   }

//   const newBillContainer = new NewBill({
//     document, onNavigate, store: mockedStore, localStorage: window.localStorage
//   })

//   const handleChangeFile = jest.fn(() => newBillContainer.handleChangeFile({
//     target: {
//       value: 'newbill.pdf',
//     },
//     preventDefault: () => {}
//   }));

//   const buttonFile = screen.getByTestId('file');
//   buttonFile.addEventListener("change", handleChangeFile);
//   fireEvent.change(buttonFile, {
//     target: {
//       files: [new File(['New Bill'], 'newbill.pdf', {type: 'application/pdf'})],
//     },
//   })

//   const handleSubmit = jest.fn(() => newBillContainer.handleSubmit({
//     target: {
//       querySelector: () => {
//       }
//     },
//     preventDefault: () => {}
//   }));

//   const buttonSubmit = screen.getByTestId('submit');
//   buttonSubmit.addEventListener("click", handleSubmit);
//   userEvent.click(buttonSubmit);
// })

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I select a new file", () => {
      describe("When the file type is correct", () => {
        test("Then the error message should be hidden and the submit button should be clickable", async () => {
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

          const handleChangeFile = jest.fn(() => newBillContainer.handleChangeFile({
            target: {
              value: 'newbill.jpg',
            },
            preventDefault: () => {}
          }));

          const buttonFile = screen.getByTestId('file');
          buttonFile.addEventListener("change", handleChangeFile);
          fireEvent.change(buttonFile, {
            target: {
              files: [new File(['New Bill'], 'newbill.jpg', {type: 'image/jpg'})],
            },
          })

          const handleSubmit = jest.fn(() => newBillContainer.handleSubmit({
            target: {
              querySelector: (element) => {
                  return { value: "" };
              }
            },
            preventDefault: () => {}
          }));

          const buttonSubmit = screen.getByTestId('submit');
          buttonSubmit.addEventListener("click", handleSubmit);
          userEvent.click(buttonSubmit);

          expect(handleChangeFile).toHaveBeenCalled();

          expect(screen.queryByTestId('errorMessage')).toBeFalsy();
          expect(buttonSubmit.disabled).toBeFalsy();

          expect(handleSubmit).toHaveBeenCalled();
        })
      })

      describe("When the file type is incorrect", () => {
        test("Then an error message should be displayed and the submit button should be disabled", () => {
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

          const handleChangeFile = jest.fn(() => newBillContainer.handleChangeFile({
            target: {
              value: 'newbill.pdf',
            },
            preventDefault: () => {}
          }));

          const buttonFile = screen.getByTestId('file');
          buttonFile.addEventListener("change", handleChangeFile);
          fireEvent.change(buttonFile, {
            target: {
              files: [new File(['New Bill'], 'newbill.pdf', {type: 'application/pdf'})],
            },
          })

          const handleSubmit = jest.fn(() => newBillContainer.handleSubmit({
            target: {
              querySelector: () => {
              }
            },
            preventDefault: () => {}
          }));

          const buttonSubmit = screen.getByTestId('submit');
          buttonSubmit.addEventListener("click", handleSubmit);
          userEvent.click(buttonSubmit);

          expect(handleChangeFile).toHaveBeenCalled();

          const errorMessage = screen.getByTestId('errorMessage');
          expect(errorMessage.getAttribute("class")).toContain("errorMessage--shown");
          expect(buttonSubmit.disabled).toBeTruthy();

          expect(handleSubmit).not.toHaveBeenCalled();
        })
      })
    })
  })
})
