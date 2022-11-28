/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    loginToApplication(): Chainable<void>;
  }
}
