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
      expect(windowIcon).toHaveClass("active-icon")
    });

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
    });

    test("Then clicking on the eye icon should open the modal", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a"}));
      document.body.innerHTML = BillsUI({ data: bills });
      new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      const modalFile = screen.getByTestId("modaleFile");
      $.fn.modal = jest.fn(() => modalFile.classList.add("show"));

      const eyeIcon = screen.getAllByTestId("icon-eye")[0];
      expect(eyeIcon).toBeInTheDocument();

      fireEvent.click(eyeIcon);
      expect(modalFile).toHaveClass("show");
    });

    test("should fetch bills list with formatted date and status", async () => {
      const billsInstance = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const fetchedBills = await billsInstance.getBills();

      const formattedBills = bills.map(bill => ({
        ...bill,
        date: formatDate(bill.date),
        status: formatStatus(bill.status)
      }));
      
      expect(fetchedBills).toEqual(formattedBills);
    });

    test("should fetch and format bills, handling invalid dates gracefully", async () => {
      const corruptedBills = [
        { id: "47qAXb6fIm2zOKkLzMro", date: "invalid-date", status: "invalid-status" },
        { id: "BeKy5Mo4jkmdfPGYpTxZ", date: "invalid-date", status: "invalid-status" },
      ];

      // Mock the store's list method to return the corrupted bills
      mockStore.bills = jest.fn(() => ({
        list: jest.fn(() => Promise.resolve(corruptedBills))
      }));

      const billsInstance = new Bills({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const fetchedBills = await billsInstance.getBills();
      expect(fetchedBills).toEqual([
        { id: "47qAXb6fIm2zOKkLzMro", date: "invalid-date", status: undefined },
        { id: "BeKy5Mo4jkmdfPGYpTxZ", date: "invalid-date", status: undefined },
      ]);
    });

    test("should return undefined when any store passed", async () => {
      const billsInstance = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      const fetchedBills = await billsInstance.getBills();
      expect(fetchedBills).toEqual(undefined);
    });
  })
})