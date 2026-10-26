describe('Cuaca Jakarta', () => {
  it('shows forecast data from the API', () => {
    cy.intercept('GET', 'https://api.open-meteo.com/v1/forecast*', {
      body: { hourly: { time: ['2026-10-18T00:00'], temperature_2m: [27.1] } },
    }).as('weather')
    cy.visit('/')
    cy.wait('@weather')
    cy.contains('ion-title', 'Cuaca Jakarta')
    cy.contains('ion-item', '2026-10-18 00:00').should('contain', '27.1 °C')
  })
})
