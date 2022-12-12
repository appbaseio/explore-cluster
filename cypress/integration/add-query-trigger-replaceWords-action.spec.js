import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';
import { PAGE_LOAD_TIME } from '../utils/constants.js';

// Track query rule id, to delete later
let ruleId;

describe('Query Rule creation with trigger index and script action', () => {
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

	it('Should create a query rule', () => {
		cy.server();
		cy.route('/arc/plan').as('plan');
		cy.route('**/_rules').as('rules');
		cy.route('**/_aliasedindices').as('indices');
		cy.visit(`${base_url}/cluster/rules`);
		cy.wait(['@plan', '@rules', '@indices'], { timeout: 30000 });

		// Click on create query rule
		cy.server();
		cy.route('**/_mapping').as('mapping');
		cy.get('[data-cy=create-query-rule]').click();
		cy.wait('@mapping', { timeout: 15000 });

		// Enter name and description
		cy.get('[name="name"]').type('cypress-testing-rule-name');
		cy.get('[name="description"]').type('cypress-testing-rule-description');

		// Trigger type "query" is initially selected

		// Select Replace words action
		cy.get('[data-cy=query-rule-action]').click();
		cy.get('[data-cy=replace_words]').click({ force: true, multiple: true });
		cy.wait(1000);
		cy.get('[data-cy=replace-words-action-add-word]').click();
		cy.get('[data-cy=original-term]').type('harry');
		cy.get('[data-cy=replace-term]').type('hary');

		// Save query rule
		const credentials = btoa(`${username}:${password}`);
		cy.server();
		cy.route({
			method: 'POST',
			url: `${app_url}_rule`,
		}).as('save');

		cy.get('[data-cy=save-query-rule]').click();
		cy.wait('@save', { timeout: 15000 }).then((xhr) => {
			ruleId = xhr?.response?.body?.id || null;
		});
	});
	it('Should delete query rule', () => {
		const credentials = btoa(`${username}:${password}`);
		if (ruleId) {
			cy.request({
				method: 'DELETE',
				url: `${app_url}_rule/${ruleId}`,
				headers: {
					Authorization: `Basic ${credentials}`,
				},
			});
		}
	});
	it('Should open arc dashboard locally', () => {
		cy.visit(`${base_url}`).wait(2000);
	});
	it('Should logout user', () => {
		cy.clearLocalStorage();
		cy.logoutUser();
	});
});
