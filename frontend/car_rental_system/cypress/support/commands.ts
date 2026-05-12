/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsApi(username: string, password: string): Chainable<string>;
      loginViaUi(username: string, password: string): Chainable<void>;
      registerCustomer(payload: {
        username: string;
        password: string;
        name: string;
        email: string;
        phone: string;
        address: string;
      }): Chainable<Cypress.Response<any>>;
    }
  }
}

Cypress.Commands.add('loginAsApi', (username: string, password: string) => {
  const apiUrl = Cypress.env('apiUrl') as string;
  return cy
    .request('POST', `${apiUrl}/auth/login`, { username, password })
    .then((res) => {
      const token = res.body.token as string;
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('userId', String(res.body.userId));
      return cy.wrap(token);
    });
});

Cypress.Commands.add('loginViaUi', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.contains('button', 'Login').click();
});

Cypress.Commands.add('registerCustomer', (payload) => {
  const apiUrl = Cypress.env('apiUrl') as string;
  return cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/register`,
    failOnStatusCode: false,
    body: {
      username: payload.username,
      password: payload.password,
      customerInfo: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
      },
    },
  });
});

export {};
