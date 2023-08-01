/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('loginToApplication' as any, ()=>{
   
    // WAY 1 LOGIN
    // cy.visit('/login');
    // cy.get('[placeholder="Email"]' as any).type('artem.bondar16@gmail.com')
    // cy.get('[placeholder="Password"]' as any).type('CypressTest1')
    // cy.get('form' as any).submit()


    // WAY 2 LOGIN
    const user = {
        user: {
          email: "artem.bondar16@gmail.com",
          password: "CypressTest1",
        },
      };
      
      cy.request("POST", "https://api.realworld.io/api/users/login", user)
      .its("body")
      .then((body) => {
        const token = body.user.token;
        cy.wrap(token).as('token') // save the data and can reuse it later like @token (alias)
        cy.visit('/',{
            onBeforeLoad(win){
                win.localStorage.setItem('jwtToken',token) // save token and in code we use this token
            }
        })
      })
})