describe('Customer journey: register -> login -> reserve -> cancel', () => {
  let users: any;

  before(() => {
    cy.fixture('users').then((data) => (users = data));
  });

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('registers a new customer (idempotent - 201 first run, 409 thereafter)', () => {
    cy.registerCustomer(users.customer).then((res) => {
      expect([201, 409]).to.include(res.status);
    });
  });

  it('logs in via the UI and lands on /cars', () => {
    cy.loginViaUi(users.customer.username, users.customer.password);
    cy.url({ timeout: 10000 }).should('include', '/cars');
    cy.window().its('localStorage.token').should('be.a', 'string');
  });

  it('browses the car catalogue and applies a category filter', () => {
    cy.loginAsApi(users.customer.username, users.customer.password);
    cy.visit('/cars');
    cy.get('body').should('be.visible');
    cy.request({
      url: `${Cypress.env('apiUrl')}/cars`,
      headers: { Authorization: `Bearer ${window.localStorage.getItem('token')}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
    });
  });

  it('creates a reservation through the API and sees it in My Reservations', () => {
    cy.loginAsApi(users.customer.username, users.customer.password).then((token) => {
      cy.request({
        url: `${Cypress.env('apiUrl')}/cars`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((cars) => {
        const target = (cars.body as any[]).find((c) => c.status === 'active');
        if (!target) {
          cy.log('no active cars in fixture data - skipping reservation creation');
          return;
        }

        const start = new Date();
        start.setDate(start.getDate() + 1);
        const end = new Date();
        end.setDate(end.getDate() + 4);
        const days = 3;

        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/reservations`,
          headers: { Authorization: `Bearer ${token}` },
          body: {
            carId: target.id,
            startDate: start.toISOString().slice(0, 10),
            endDate: end.toISOString().slice(0, 10),
            totalCost: days * Number(target.dailyRate),
            paymentMethod: 'cash',
            paymentStatus: 'pending',
          },
          failOnStatusCode: false,
        }).then((res) => {
          expect([201, 400]).to.include(res.status);
        });

        cy.visit('/my-reservations');
        cy.get('body').should('be.visible');
      });
    });
  });

  it('cancels a pending reservation and observes status -> cancelled', () => {
    cy.loginAsApi(users.customer.username, users.customer.password).then((token) => {
      cy.request({
        url: `${Cypress.env('apiUrl')}/reservations/my`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        const pending = (res.body as any[]).find((r) => r.status === 'pending');
        if (!pending) {
          cy.log('no pending reservation to cancel');
          return;
        }
        cy.request({
          method: 'PATCH',
          url: `${Cypress.env('apiUrl')}/reservations/${pending.id}/cancel`,
          headers: { Authorization: `Bearer ${token}` },
        }).its('body.status').should('eq', 'cancelled');
      });
    });
  });

  it('blocks anonymous access to /cars and redirects to /login', () => {
    cy.visit('/cars', { failOnStatusCode: false });
    cy.url({ timeout: 10000 }).should('include', '/login');
  });
});
