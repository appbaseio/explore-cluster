import generateName from '../utils/generateName';
import { base_url, username, password, app_url, cluster } from '../utils/index';

describe('Query Rule creation with trigger index and script action', () => {
    before(() => {
		cy.window().then((win) => {
			win.sessionStorage.clear();
		});
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

	it('Should create a query rule', () => {
		cy.get('[data-cy=create-query-rule]').click();

		// Enter name and description
		cy.get('[name="name"]').type('cypress-testing-rule-name');
		cy.get('[name="description"]').type('cypress-testing-rule-description');

		// Trigger type "query" is initially selected

		// Select Replace words action
		cy.get('[data-cy=query-rule-action]').click();
		cy.get('[data-cy=replace_words]').click({ force: true, multiple: true });
		cy.wait(1000);
		cy.get('[data-cy=replace-words-action-add-word]').click()
        cy.get('[data-cy=original-term]').type('harry');
        cy.get('[data-cy=replace-term]').type('hary');

        // Save query rule
		const credentials = btoa(`${username}:${password}`);
		cy.server();
		cy.route({
			method: "POST",
			url: `${app_url}_rule`,
		}).as("save");

		cy.get('[data-cy=save-query-rule]').click();
		cy.wait("@save", {timeout: 15000});

		cy.get("@save").then(xhr => {
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
});
