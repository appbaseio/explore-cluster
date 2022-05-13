import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

describe('Query Rule creation with trigger index and filter action', () => {
	before(() => {
		cy.window().then((win) => {
			win.localStorage.clear();
			win.sessionStorage.clear();
		});
	});
	beforeEach(() => {
		cy.restoreLocalStorage();
	});
	afterEach(() => {
		cy.saveLocalStorage();
	});

	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(2000);
	});

	it('Should login from cluster URL', () => {
		cy.loginUser(username, password, cluster);
		cy.wait(3000);
	});

	it('Should open query rules page', () => {
		cy.visit(`${base_url}/cluster/rules`).wait(2000);
	});

	it('Should open new query rule form page', () => {
		cy.get('[data-cy=create-query-rule]').click();
		cy.wait(3000);
	});

	it('Should create a query rule', () => {
		// Enter name and description
		cy.get('[name="name"]').type('cypress-testing-rule-name');
		cy.get('[name="description"]').type('cypress-testing-rule-description');

		// Trigger type "query" is initially selected

		// Select Add filter action
		cy.get('[data-cy=query-rule-action]').click();
		cy.get('[data-cy=add_filter]').click({ force: true, multiple: true });
		cy.wait(1000);
		cy.get('[data-cy=add-filter-action]').click();
		cy.get('[data-cy=filter-key]').click({ force: true, multiple: true });
		cy.get('[data-cy=brand]').click();
		cy.get('[data-cy=filter-values]').type('apple,samsung,');

		// Save query rule
		const credentials = btoa(`${username}:${password}`);
		cy.server();
		cy.route({
			method: 'POST',
			url: `${app_url}_rule`,
		}).as('save');

		cy.get('[data-cy=save-query-rule]').click();
		cy.wait('@save', { timeout: 15000 });

		cy.get('@save').then((xhr) => {
			const ruleId = xhr?.response?.body?.id || null;
			cy.request({
				method: 'DELETE',
				url: `${app_url}_rule/${ruleId}`,
				headers: {
					Authorization: `Basic ${credentials}`,
				},
			}).wait(2000);
			cy.visit(`${base_url}/cluster/rules`);
		});
	});
	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});
});
