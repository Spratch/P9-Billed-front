/**
 * @jest-environment jsdom
 */

import { getByTestId, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import user from '@testing-library/user-event';


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should renders new bill form page", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      
      expect(getByTestId(document.body, 'form-new-bill')).toBeDefined()
    })

    // test("When I upload a file with an invalid extension, an error message should be displayed", () => {
    //   const html = NewBillUI()
    //   document.body.innerHTML = html

    //   const fileInput = screen.getByTestId('file')
    //   const file = new File(['content'], 'file.txt', { type: 'text/plain' })

    //   user.upload(fileInput, file)

    //   expect(screen.getByTestId('file-error')).toBeDefined()
    //   expect(screen.getByTestId('file-error').textContent).toBe("Uploadez une image en PNG, JPG ou JPEG")
    // })


  })


})
