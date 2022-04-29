// ***********************************************
// This example commands.js shows you how to
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
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('loginUser', (username, password, cluster) => {
	cy.get('[data-cy=cluster-url]')
		.clear()
		.type(`https://${username}:${password}@${cluster}`)
		.wait(1000)
		.blur()
		.wait(1000);
	cy.get('[data-cy=signin-button]').click();
});

Cypress.Commands.add('logoutUser', () => {
	cy.get('[data-cy=logout-menu]').click().wait(1000).get('[data-cy=logout-button]').click();
});

// ----------------START: stored-query commands----------------------

Cypress.Commands.add('openPageSQ', (url) => {
	cy.wait(2000);
	cy.visit(`${url}/cluster/stored-queries`).wait(2500);
	cy.contains('Create Stored Query').click();
});

Cypress.Commands.add('typeInMonacoEditorSQ', (value) => {
	cy.get('.view-lines.monaco-mouse-cursor-text').click().type(value);
	cy.contains('Beautify').click({ force: true });
	cy.wait(2000);
});

Cypress.Commands.add('saveSQ', (storedQueryId) => {
	cy.contains('Review and Save').click();
	cy.wait(2500);
});

Cypress.Commands.add('deleteSQ', (storedQueryId) => {
	cy.get(`[data-row-key=${storedQueryId}test]`).find('[data-cy=sq-delete]').click();
	cy.contains('Yes').click();
	cy.wait(1500);
});

Cypress.Commands.add('openEditWindowSQ', (storedQueryId) => {
	cy.get(`[data-row-key=${storedQueryId}test]`).find('[data-cy=sq-edit]').click({ force: true });
	cy.wait(500);
});

// ----------------END: stored-query commands----------------------
let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add('saveLocalStorage', () => {
	Object.keys(localStorage).forEach((key) => {
		LOCAL_STORAGE_MEMORY[key] = localStorage[key];
	});
});

Cypress.Commands.add('restoreLocalStorage', () => {
	Object.keys(LOCAL_STORAGE_MEMORY).forEach((key) => {
		localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
	});
});

Cypress.Commands.add('clearLocalStorage', () => {
	LOCAL_STORAGE_MEMORY = {};
});
