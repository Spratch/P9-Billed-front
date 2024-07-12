/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom'
import Bills from '../containers/Bills.js';
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";
import { formatDate, formatStatus } from "../app/format.js";

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
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon")

    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then clicking on new bill button should navigate to NewBill page", async () => {
      document.body.innerHTML = BillsUI({ data: bills })

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      
      const buttonNewBill = screen.getByTestId('btn-new-bill');
      expect(buttonNewBill).toBeInTheDocument();
      
      fireEvent.click(buttonNewBill);
      const formNewBill = await screen.findByTestId("form-new-bill");
      expect(formNewBill).toBeInTheDocument();
    })

    test("Then clicking on the eye icon should open the modal", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a"}));
      document.body.innerHTML = BillsUI({ data: bills });
      new Bills({ document, onNavigate, mockStore, localStorage: window.localStorage });

      const modalFile = screen.getByTestId("modaleFile");
      $.fn.modal = jest.fn(() => modalFile.classList.add("show"));

      const eyeIcon = screen.getAllByTestId("icon-eye")[0];
      expect(eyeIcon).toBeInTheDocument();

      fireEvent.click(eyeIcon);
      expect(modalFile).toHaveClass("show");
    })

    test("Then bills should be fetched", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a"}));
      document.body.innerHTML = BillsUI({ data: bills });
      new Bills({ document, onNavigate, mockStore, localStorage: window.localStorage });

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const contentPending  = await waitFor(() => screen.getAllByTestId("icon-eye")[0])
      expect(contentPending).toBeTruthy()
      console.log(screen.getByTestId('tbody'))

      // const date = formatDate("2001-01-01");
      // console.log("Date: ",date);
      // const displayedDate = screen.getByText(date)
      // expect(displayedDate).toBeInTheDocument()
      const status = "pending"
      expect(screen.getByTestId("tbody")).toMatchSnapshot()
      expect(screen.getAllByText(status)[0]).toBeInTheDocument()
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", { value: localStorageMock });
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a"}));

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()  
      })

      test("should fetch bills from API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })
    })
  })
})
