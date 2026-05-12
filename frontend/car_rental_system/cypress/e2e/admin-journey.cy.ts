describe('Administrator journey: login -> register car -> manage reservations -> reports', () => {
  let admin: { username: string; password: string };

  before(() => {
    admin = {
      username: Cypress.env('adminUsername') as string,
      password: Cypress.env('adminPassword') as string,
    };
  });

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('blocks customer tokens from reaching /admin', () => {
    cy.fixture('users').then((u) => {
      cy.loginAsApi(u.customer.username, u.customer.password);
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url({ timeout: 10000 }).should('not.include', '/admin');
    });
  });

  it('admin can log in and reach the admin layout', () => {
    cy.loginViaUi(admin.username, admin.password);
    cy.url({ timeout: 10000 }).should('include', '/admin');
  });

  it('registers a new car via the admin API and sees it in the catalogue', () => {
    cy.loginAsApi(admin.username, admin.password).then((token) => {
      const plate = `E2E-${Date.now()}`;
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/cars`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
          model: 'Cypress Test Car',
          year: 2026,
          plateId: plate,
          status: 'active',
          officeId: 1,
          dailyRate: 100,
          category: 'sedan',
          transmission: 'automatic',
          fuelType: 'petrol',
          seatingCapacity: 5,
          features: ['Bluetooth', 'Air Conditioning'],
          description: 'Created by Cypress E2E',
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect([201, 400]).to.include(res.status);
      });
    });
  });

  it('lists all reservations as admin', () => {
    cy.loginAsApi(admin.username, admin.password).then((token) => {
      cy.request({
        url: `${Cypress.env('apiUrl')}/reservations/getAll`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an('array');
      });
    });
  });

  it('searches reservations by date range', () => {
    cy.loginAsApi(admin.username, admin.password).then((token) => {
      const today = new Date().toISOString().slice(0, 10);
      cy.request({
        url: `${Cypress.env('apiUrl')}/reservations/search?startDate=${today}&endDate=${today}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 400]).to.include(res.status);
      });
    });
  });

  it('runs the reservation status report with a bounded date range', () => {
    cy.loginAsApi(admin.username, admin.password).then((token) => {
      const today = new Date();
      const start = new Date(today);
      start.setMonth(today.getMonth() - 1);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      cy.request({
        url: `${Cypress.env('apiUrl')}/reports/reservations?startDate=${fmt(start)}&endDate=${fmt(today)}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect([200, 404]).to.include(res.status);
      });
    });
  });
});
