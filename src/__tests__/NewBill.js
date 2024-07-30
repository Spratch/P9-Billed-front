/**
 * @jest-environment jsdom
 */

import { fireEvent, getByTestId, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import user from '@testing-library/user-event';
import mockStore from "../__mocks__/store"
import mockedBills from "../__mocks__/store.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import '@testing-library/jest-dom'


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should renders new bill form page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      expect(getByTestId(document.body, 'form-new-bill')).toBeDefined()
    })

    describe("When I try to upload a file", () => {
      beforeEach(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })

        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.NewBill)
      })

      afterEach(() => {
        jest.clearAllMocks()
      })
  
      test("Then if it is not an image it should display an error message and disable submit button", () => {
        const formInstance = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        
        const fileInput = screen.getAllByTestId("file")[0]
        const file = new File([""], "test.txt", { type: "text/plain"})
        
        const event = {
          preventDefault: jest.fn(),
          target: { files: [file], value: "C:\\fakepath\\test.txt" }
        }
        
        fileInput.dispatchEvent(new Event("change"))
        formInstance.handleChangeFile(event)
        
        expect(screen.getAllByTestId("file-error")[0].textContent).toBe("Uploadez une image en PNG, JPG ou JPEG")
        const submitButton = screen.getByTestId("submit-button")
        expect(submitButton).toBeDisabled()
      })

      test("Then if it is an image, it should enable the submit button", () => {
        const formInstance = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        
        const fileInput = screen.getAllByTestId("file")[0]
        const file = new File([""], "test.jpg", { type: "image/jpeg"})
        
        const event = {
          preventDefault: jest.fn(),
          target: { files: [file], value: "C:\\fakepath\\test.jpg" }
        }
        
        fileInput.dispatchEvent(new Event("change"))
        formInstance.handleChangeFile(event)
        
        const submitButton = screen.getByTestId("submit-button")
        expect(submitButton).toBeEnabled()
      })
    })

    /* NewBill POST test */
    describe("When I try to submit a new bill", () => {
      test("Then it should create a bill object", () => {
        Object.defineProperty(window, "localStorage", { value: localStorageMock, })

        window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))
        document.body.innerHTML = NewBillUI({})

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        };

        const formInstance = new NewBill({ document, onNavigate, store: mockedBills, localStorage: window.localStorage })

        const submit = screen.getByTestId('form-new-bill')

        const bill = {
          "id": "47qAXb6fIm2zOKkLzMro",
          "vat": "80",
          "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
          "status": "pending",
          "type": "Hôtel et logement",
          "commentary": "séminaire billed",
          "name": "encore",
          "fileName": "preview-facture-free-201801-pdf-1.jpg",
          "date": "2004-04-04",
          "amount": 400,
          "commentAdmin": "ok",
          "email": "a@a",
          "pct": 20    
        }
  
        const handleSubmit = jest.fn((e) => formInstance.handleSubmit(e))
        document.querySelector(`select[data-testid="expense-type"]`).value = bill.type
        document.querySelector(`input[data-testid="expense-name"]`).value = bill.name
        document.querySelector(`input[data-testid="amount"]`).value = bill.amount
        document.querySelector(`input[data-testid="datepicker"]`).value = bill.date
        document.querySelector(`input[data-testid="vat"]`).value = bill.vat
        document.querySelector(`input[data-testid="pct"]`).value = bill.pct
        document.querySelector(`textarea[data-testid="commentary"]`).value = bill.commentary
        formInstance.fileUrl = bill.fileUrl
        formInstance.fileName = bill.fileName

        submit.addEventListener('click', handleSubmit)
        fireEvent.click(submit)
        
        expect(handleSubmit).toHaveBeenCalledTimes(1)
        expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
      })
    })
  })


})
